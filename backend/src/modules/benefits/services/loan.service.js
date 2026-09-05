'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const money = require('../../../utils/money');
const { LOAN_STATUS, LOAN_INTEREST_MODE } = require('../../../config/constants');

function nextLoanCode() {
  return `LN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;
}

function computeSchedule({ principal, tenureMonths, interestMode, ratePercent, feePercent }) {
  const monthlyRate = money.divide(ratePercent, 12 * 100);
  const fee = money.percentOf(principal, feePercent || 0);

  if (interestMode === LOAN_INTEREST_MODE.ZERO || monthlyRate === 0) {
    const emi = money.divide(principal, tenureMonths);
    return {
      monthly_installment: emi,
      total_repayable: money.add(principal, fee),
      processing_fee_amount: fee,
    };
  }
  if (interestMode === LOAN_INTEREST_MODE.FLAT) {
    const totalInterest = money.multiply(
      money.multiply(principal, money.divide(ratePercent, 100)),
      money.divide(tenureMonths, 12)
    );
    const total = money.add(principal, totalInterest);
    const emi = money.divide(total, tenureMonths);
    return {
      monthly_installment: emi,
      total_repayable: money.add(total, fee),
      processing_fee_amount: fee,
    };
  }
  // reducing balance EMI formula
  const r = monthlyRate;
  const n = tenureMonths;
  const numerator = principal * r * Math.pow(1 + r, n);
  const denominator = Math.pow(1 + r, n) - 1;
  const emi = money.round(numerator / denominator);
  const total = money.multiply(emi, n);
  return {
    monthly_installment: emi,
    total_repayable: money.add(total, fee),
    processing_fee_amount: fee,
  };
}

async function apply({ organizationId, employeeId, loanProgramId, requestedAmount, tenureMonths, reason }) {
  return sequelize.transaction(async (transaction) => {
    const program = await models.LoanProgram.findOne({
      where: { id: loanProgramId, organization_id: organizationId },
      transaction,
    });
    if (!program) throw AppError.notFound('Loan program not found');
    if (!program.is_active) throw AppError.conflict('Loan program is inactive');

    const amount = money.toNumber(requestedAmount);
    if (amount < money.toNumber(program.min_amount) || amount > money.toNumber(program.max_amount)) {
      throw AppError.unprocessable('Requested amount is outside program limits', {
        min_amount: program.min_amount,
        max_amount: program.max_amount,
      });
    }
    if (
      tenureMonths < program.min_tenure_months ||
      tenureMonths > program.max_tenure_months
    ) {
      throw AppError.unprocessable('Tenure is outside program limits', {
        min: program.min_tenure_months,
        max: program.max_tenure_months,
      });
    }

    const schedule = computeSchedule({
      principal: amount,
      tenureMonths,
      interestMode: program.interest_mode,
      ratePercent: money.toNumber(program.interest_rate_percent),
      feePercent: money.toNumber(program.processing_fee_percent),
    });

    // Honor the program's approval configuration so requires_manager_approval
    // is not dead: skip manager review when it is not required.
    let initialStatus = LOAN_STATUS.SUBMITTED;
    let approvedAmount = null;
    if (!program.requires_manager_approval) {
      approvedAmount = amount;
      initialStatus = program.requires_admin_approval ? LOAN_STATUS.UNDER_REVIEW : LOAN_STATUS.APPROVED;
    }

    return models.Loan.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        loan_program_id: program.id,
        code: nextLoanCode(),
        requested_amount: amount,
        approved_amount: approvedAmount,
        currency: program.currency,
        tenure_months: tenureMonths,
        interest_mode: program.interest_mode,
        interest_rate_percent: program.interest_rate_percent,
        processing_fee_amount: schedule.processing_fee_amount,
        monthly_installment: schedule.monthly_installment,
        total_repayable: schedule.total_repayable,
        salary_deduction: program.salary_deduction_default,
        reason: reason || null,
        status: initialStatus,
      },
      { transaction }
    );
  });
}

async function managerReview({ organizationId, id, managerUserId, decidedAmount, note, approve }) {
  const loan = await models.Loan.findOne({
    where: { id, organization_id: organizationId },
    include: [{ model: models.LoanProgram, as: 'program' }],
  });
  if (!loan) throw AppError.notFound('Loan not found');
  if (loan.status !== LOAN_STATUS.SUBMITTED) throw AppError.conflict('Loan is not in submitted state');

  loan.manager_reviewer_id = managerUserId;
  loan.manager_reviewed_at = new Date();
  loan.manager_note = note || null;

  if (!approve) {
    loan.status = LOAN_STATUS.REJECTED;
    await loan.save();
    return loan;
  }

  const amount = decidedAmount ?? money.toNumber(loan.requested_amount);
  // Re-validate the decided amount against program limits so a reviewer cannot
  // approve outside policy.
  if (amount <= 0) throw AppError.unprocessable('Approved amount must be greater than zero');
  if (loan.program && (amount < money.toNumber(loan.program.min_amount) || amount > money.toNumber(loan.program.max_amount))) {
    throw AppError.unprocessable('Approved amount is outside program limits', {
      min_amount: loan.program.min_amount,
      max_amount: loan.program.max_amount,
    });
  }
  loan.approved_amount = amount;

  const schedule = computeSchedule({
    principal: amount,
    tenureMonths: loan.tenure_months,
    interestMode: loan.interest_mode,
    ratePercent: money.toNumber(loan.interest_rate_percent),
    feePercent: money.toNumber(loan.program.processing_fee_percent),
  });
  loan.processing_fee_amount = schedule.processing_fee_amount;
  loan.monthly_installment = schedule.monthly_installment;
  loan.total_repayable = schedule.total_repayable;

  loan.status = loan.program.requires_admin_approval ? LOAN_STATUS.UNDER_REVIEW : LOAN_STATUS.APPROVED;
  await loan.save();
  return loan;
}

async function adminReview({ organizationId, id, adminUserId, approve, note }) {
  const loan = await models.Loan.findOne({ where: { id, organization_id: organizationId } });
  if (!loan) throw AppError.notFound('Loan not found');
  if (loan.status !== LOAN_STATUS.UNDER_REVIEW) throw AppError.conflict('Loan is not pending admin review');
  // Segregation of duties: the admin approver must differ from the manager who
  // reviewed the loan.
  if (adminUserId && loan.manager_reviewer_id && adminUserId === loan.manager_reviewer_id) {
    throw AppError.forbidden('The admin approver must be a different person from the manager reviewer');
  }
  loan.admin_reviewer_id = adminUserId;
  loan.admin_reviewed_at = new Date();
  loan.admin_note = note || null;
  loan.status = approve ? LOAN_STATUS.APPROVED : LOAN_STATUS.REJECTED;
  await loan.save();
  return loan;
}

async function disburse({ organizationId, id, disburserUserId }) {
  return sequelize.transaction(async (transaction) => {
    const loan = await models.Loan.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!loan) throw AppError.notFound('Loan not found');
    if (loan.status !== LOAN_STATUS.APPROVED) throw AppError.conflict('Only approved loans can be disbursed');
    loan.status = LOAN_STATUS.DISBURSED;
    loan.disbursed_by = disburserUserId;
    loan.disbursed_at = new Date();
    loan.outstanding_amount = money.toNumber(loan.total_repayable);
    await loan.save({ transaction });
    return loan;
  });
}

async function recordRepayment({ organizationId, id, mode, amount, currency, payslipId, externalReference, note }) {
  return sequelize.transaction(async (transaction) => {
    const loan = await models.Loan.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!loan) throw AppError.notFound('Loan not found');
    if (![LOAN_STATUS.DISBURSED, LOAN_STATUS.REPAYING].includes(loan.status)) {
      throw AppError.conflict('Loan is not in a repayable state');
    }
    const outstanding = money.toNumber(loan.outstanding_amount);
    let numericAmount = money.toNumber(amount);
    if (numericAmount <= 0) throw AppError.badRequest('Repayment amount must be greater than zero');
    // Never record more than the outstanding balance so the ledger reconciles.
    if (numericAmount > outstanding) numericAmount = outstanding;

    const repayment = await models.LoanRepayment.create(
      {
        loan_id: loan.id,
        payslip_id: payslipId || null,
        mode,
        amount: numericAmount,
        currency: currency || loan.currency,
        external_reference: externalReference || null,
        note: note || null,
      },
      { transaction }
    );

    const newOutstanding = Math.max(0, money.subtract(money.toNumber(loan.outstanding_amount), numericAmount));
    loan.outstanding_amount = newOutstanding;
    if (newOutstanding <= 0) {
      loan.status = LOAN_STATUS.CLOSED;
      loan.closed_at = new Date();
    } else {
      loan.status = LOAN_STATUS.REPAYING;
    }
    await loan.save({ transaction });
    return { loan, repayment };
  });
}

module.exports = { apply, managerReview, adminReview, disburse, recordRepayment, computeSchedule };
