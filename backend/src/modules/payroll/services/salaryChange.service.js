'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const money = require('../../../utils/money');
const { CHANGE_REQUEST_STATUS, CONTRACT_STATUS } = require('../../../config/constants');
const contractService = require('./contract.service');

async function suggest({ organizationId, employeeId, changeType, amount, percent, reason, suggestedBy, effectiveFrom }) {
  if (!amount && !percent) throw AppError.badRequest('Either amount or percent must be provided');

  const currentContract = await models.Contract.findOne({
    where: { employee_id: employeeId, status: CONTRACT_STATUS.ACTIVE },
    order: [['start_date', 'DESC']],
  });

  return models.SalaryChangeRequest.create({
    organization_id: organizationId,
    employee_id: employeeId,
    current_contract_id: currentContract ? currentContract.id : null,
    change_type: changeType,
    suggested_amount: amount || null,
    suggested_percent: percent || null,
    suggested_reason: reason,
    suggested_by: suggestedBy,
    effective_from: effectiveFrom || null,
    status: CHANGE_REQUEST_STATUS.PENDING_PAYROLL_REVIEW,
  });
}

async function payrollDecide({ id, payrollReviewerId, decidedAmount, note }) {
  const request = await models.SalaryChangeRequest.findByPk(id);
  if (!request) throw AppError.notFound('Salary change request not found');
  if (request.status !== CHANGE_REQUEST_STATUS.PENDING_PAYROLL_REVIEW) {
    throw AppError.conflict('Only pending payroll reviews can be decided');
  }
  if (!decidedAmount) throw AppError.badRequest('Payroll must provide a decided amount');

  request.payroll_reviewer_id = payrollReviewerId;
  request.payroll_decided_amount = decidedAmount;
  request.payroll_decision_note = note || null;
  request.payroll_decided_at = new Date();
  request.status = CHANGE_REQUEST_STATUS.PENDING_ADMIN_APPROVAL;
  await request.save();
  return request;
}

async function adminApprove({ id, adminReviewerId, note }) {
  const request = await models.SalaryChangeRequest.findByPk(id);
  if (!request) throw AppError.notFound('Salary change request not found');
  if (request.status !== CHANGE_REQUEST_STATUS.PENDING_ADMIN_APPROVAL) {
    throw AppError.conflict('Request is not awaiting admin approval');
  }
  request.admin_reviewer_id = adminReviewerId;
  request.admin_decision_note = note || null;
  request.admin_decided_at = new Date();
  request.status = CHANGE_REQUEST_STATUS.APPROVED;
  await request.save();
  return request;
}

async function reject({ id, adminReviewerId, note }) {
  const request = await models.SalaryChangeRequest.findByPk(id);
  if (!request) throw AppError.notFound('Salary change request not found');
  if (![CHANGE_REQUEST_STATUS.PENDING_ADMIN_APPROVAL, CHANGE_REQUEST_STATUS.PENDING_PAYROLL_REVIEW].includes(
    request.status
  )) {
    throw AppError.conflict('Request cannot be rejected in current state');
  }
  request.admin_reviewer_id = adminReviewerId || request.admin_reviewer_id;
  request.admin_decision_note = note || request.admin_decision_note;
  request.admin_decided_at = new Date();
  request.status = CHANGE_REQUEST_STATUS.REJECTED;
  await request.save();
  return request;
}

async function apply({ id, actorUserId }) {
  return sequelize.transaction(async (transaction) => {
    const request = await models.SalaryChangeRequest.findByPk(id, { transaction });
    if (!request) throw AppError.notFound('Salary change request not found');
    if (request.status !== CHANGE_REQUEST_STATUS.APPROVED) {
      throw AppError.conflict('Only approved requests can be applied');
    }

    const current = request.current_contract_id
      ? await models.Contract.findByPk(request.current_contract_id, { transaction })
      : await models.Contract.findOne({
          where: { employee_id: request.employee_id, status: CONTRACT_STATUS.ACTIVE },
          order: [['start_date', 'DESC']],
          transaction,
        });

    if (!current) throw AppError.badRequest('No current contract to apply the change to');

    const newWage = money.toNumber(request.payroll_decided_amount);
    if (newWage <= 0) throw AppError.badRequest('Decided amount must be greater than zero');

    const effective = request.effective_from
      ? new Date(request.effective_from)
      : new Date();
    const effectiveDate = effective.toISOString().slice(0, 10);

    await contractService.endPreviousActiveContracts({
      employeeId: request.employee_id,
      newStartDate: effectiveDate,
      transaction,
    });

    const newContract = await models.Contract.create(
      {
        organization_id: current.organization_id,
        employee_id: current.employee_id,
        salary_structure_id: current.salary_structure_id,
        working_schedule_id: current.working_schedule_id,
        title: current.title,
        department: current.department,
        position: current.position,
        start_date: effectiveDate,
        end_date: null,
        wage_amount: newWage,
        wage_currency: current.wage_currency,
        wage_period: current.wage_period,
        probation_end_date: null,
        notice_period_days: current.notice_period_days,
        status: CONTRACT_STATUS.ACTIVE,
        terms: current.terms,
        metadata: {
          ...(current.metadata || {}),
          originated_from_change_request: request.id,
          applied_by: actorUserId || null,
        },
      },
      { transaction }
    );

    request.status = CHANGE_REQUEST_STATUS.APPLIED;
    request.applied_contract_id = newContract.id;
    request.applied_at = new Date();
    await request.save({ transaction });

    return { request, contract: newContract };
  });
}

module.exports = { suggest, payrollDecide, adminApprove, reject, apply };
