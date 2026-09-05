'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const money = require('../../../utils/money');
const env = require('../../../config/env');
const {
  ADVANCE_SALARY_STATUS,
  ADVANCE_SALARY_REPAYMENT_MODE,
  CONTRACT_STATUS,
} = require('../../../config/constants');

async function createRequest({ organizationId, employeeId, requestedAmount, reason, repaymentMode, emiMonths }) {
  return sequelize.transaction(async (transaction) => {
    const contract = await models.Contract.findOne({
      where: { employee_id: employeeId, organization_id: organizationId, status: CONTRACT_STATUS.ACTIVE },
      order: [['start_date', 'DESC']],
      transaction,
    });
    if (!contract) throw AppError.badRequest('No active contract for employee');

    const wage = money.toNumber(contract.wage_amount);
    if (wage <= 0) throw AppError.badRequest('Active contract has no wage amount');

    const maxAllowed = money.percentOf(wage, env.payroll.advanceSalary.maxPercent);
    if (requestedAmount > maxAllowed) {
      throw AppError.unprocessable(
        `Requested amount exceeds the maximum allowed advance of ${maxAllowed} ${contract.wage_currency}`,
        { max_allowed: maxAllowed, currency: contract.wage_currency }
      );
    }

    if (repaymentMode === ADVANCE_SALARY_REPAYMENT_MODE.EMI) {
      const min = env.payroll.advanceSalary.minEmiMonths;
      const max = env.payroll.advanceSalary.maxEmiMonths;
      if (!emiMonths || emiMonths < min || emiMonths > max) {
        throw AppError.badRequest(`EMI months must be between ${min} and ${max}`);
      }
    }

    const feePercent = env.payroll.advanceSalary.feePercent;
    const feeAmount = money.percentOf(requestedAmount, feePercent);
    const disbursementAmount = money.subtract(requestedAmount, feeAmount);

    const created = await models.AdvanceSalaryRequest.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        contract_id: contract.id,
        requested_amount: requestedAmount,
        currency: contract.wage_currency,
        service_fee_percent: feePercent,
        service_fee_amount: feeAmount,
        disbursement_amount: disbursementAmount,
        repayment_mode: repaymentMode,
        emi_months: repaymentMode === ADVANCE_SALARY_REPAYMENT_MODE.EMI ? emiMonths : null,
        outstanding_amount: requestedAmount,
        reason,
        status: ADVANCE_SALARY_STATUS.REQUESTED,
      },
      { transaction }
    );

    return created;
  });
}

async function approve({ id, organizationId, approvedAmount, approvedBy }) {
  const request = await models.AdvanceSalaryRequest.findOne({ where: { id, organization_id: organizationId } });
  if (!request) throw AppError.notFound('Advance salary request not found');
  if (request.status !== ADVANCE_SALARY_STATUS.REQUESTED) {
    throw AppError.conflict('Only requested advances can be approved');
  }
  const requested = money.toNumber(request.requested_amount);
  const amount = approvedAmount ?? requested;
  if (amount <= 0) throw AppError.unprocessable('Approved amount must be greater than zero');
  if (amount > requested) {
    throw AppError.unprocessable('Approved amount cannot exceed the requested amount', { requested });
  }
  // Re-assert the wage cap in case the approver tries to exceed policy.
  const contract = await models.Contract.findOne({
    where: { id: request.contract_id, organization_id: organizationId },
  });
  if (contract) {
    const maxAllowed = money.percentOf(money.toNumber(contract.wage_amount), env.payroll.advanceSalary.maxPercent);
    if (amount > maxAllowed) {
      throw AppError.unprocessable(`Approved amount exceeds the maximum allowed advance of ${maxAllowed}`, { max_allowed: maxAllowed });
    }
  }
  request.approved_amount = amount;
  request.outstanding_amount = amount;
  request.service_fee_amount = money.percentOf(amount, money.toNumber(request.service_fee_percent));
  request.disbursement_amount = money.subtract(amount, money.toNumber(request.service_fee_amount));
  request.status = ADVANCE_SALARY_STATUS.APPROVED;
  request.approved_by = approvedBy;
  request.approved_at = new Date();
  await request.save();
  return request;
}

async function reject({ id, organizationId }) {
  const request = await models.AdvanceSalaryRequest.findOne({ where: { id, organization_id: organizationId } });
  if (!request) throw AppError.notFound('Advance salary request not found');
  if (request.status !== ADVANCE_SALARY_STATUS.REQUESTED) {
    throw AppError.conflict('Only requested advances can be rejected');
  }
  request.status = ADVANCE_SALARY_STATUS.REJECTED;
  await request.save();
  return request;
}

async function markDisbursed({ id, organizationId, disbursedBy, externalReference }) {
  return sequelize.transaction(async (transaction) => {
    const request = await models.AdvanceSalaryRequest.findOne({ where: { id, organization_id: organizationId }, transaction });
    if (!request) throw AppError.notFound('Advance salary request not found');
    if (request.status !== ADVANCE_SALARY_STATUS.APPROVED) {
      throw AppError.conflict('Only approved advances can be disbursed');
    }
    request.status = ADVANCE_SALARY_STATUS.DISBURSED;
    request.disbursed_by = disbursedBy;
    request.disbursed_at = new Date();
    await request.save({ transaction });

    await models.PayrollTransaction.create(
      {
        organization_id: request.organization_id,
        employee_id: request.employee_id,
        transaction_type: 'advance_disbursement',
        amount: money.toNumber(request.disbursement_amount),
        currency: request.currency,
        status: 'completed',
        external_reference: externalReference || null,
        initiated_by: disbursedBy,
        completed_at: new Date(),
      },
      { transaction }
    );

    return request;
  });
}

async function recordRepayment({ id, organizationId, mode, amount, currency, payslipId, externalReference, note }) {
  return sequelize.transaction(async (transaction) => {
    const request = await models.AdvanceSalaryRequest.findOne({ where: { id, organization_id: organizationId }, transaction });
    if (!request) throw AppError.notFound('Advance salary request not found');
    if (![ADVANCE_SALARY_STATUS.DISBURSED, ADVANCE_SALARY_STATUS.RECOVERING].includes(request.status)) {
      throw AppError.conflict('Advance is not in a repayable state');
    }
    const outstanding = money.toNumber(request.outstanding_amount);
    let numericAmount = money.toNumber(amount);
    if (numericAmount <= 0) throw AppError.badRequest('Repayment amount must be greater than zero');
    // Never record more than the outstanding balance.
    if (numericAmount > outstanding) numericAmount = outstanding;

    const repayment = await models.AdvanceSalaryRepayment.create(
      {
        advance_salary_request_id: id,
        payslip_id: payslipId || null,
        mode,
        amount: numericAmount,
        currency: currency || request.currency,
        external_reference: externalReference || null,
        note,
      },
      { transaction }
    );

    const newOutstanding = Math.max(0, money.subtract(money.toNumber(request.outstanding_amount), numericAmount));
    request.outstanding_amount = newOutstanding;
    if (newOutstanding <= 0) {
      request.status = ADVANCE_SALARY_STATUS.SETTLED;
      request.settled_at = new Date();
    } else {
      request.status = ADVANCE_SALARY_STATUS.RECOVERING;
    }
    await request.save({ transaction });

    return { request, repayment };
  });
}

async function convertToEmi({ id, organizationId, emiMonths }) {
  const request = await models.AdvanceSalaryRequest.findOne({ where: { id, organization_id: organizationId } });
  if (!request) throw AppError.notFound('Advance salary request not found');
  if (![ADVANCE_SALARY_STATUS.DISBURSED, ADVANCE_SALARY_STATUS.RECOVERING].includes(request.status)) {
    throw AppError.conflict('Only active advances can be converted to EMI');
  }
  const min = env.payroll.advanceSalary.minEmiMonths;
  const max = env.payroll.advanceSalary.maxEmiMonths;
  if (!emiMonths || emiMonths < min || emiMonths > max) {
    throw AppError.badRequest(`EMI months must be between ${min} and ${max}`);
  }
  request.repayment_mode = ADVANCE_SALARY_REPAYMENT_MODE.EMI;
  request.emi_months = emiMonths;
  await request.save();
  return request;
}

module.exports = {
  createRequest,
  approve,
  reject,
  markDisbursed,
  recordRepayment,
  convertToEmi,
};
