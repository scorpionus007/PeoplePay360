'use strict';

const crypto = require('crypto');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const money = require('../../../utils/money');
const {
  RELOCATION_STATUS,
  RELOCATION_BUDGET_STATUS,
} = require('../../../config/constants');

function newCaseCode() {
  return `RL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function request({ organizationId, requestedBy, payload }) {
  const employee = await models.Employee.findOne({
    where: { id: payload.employee_id, organization_id: organizationId },
  });
  if (!employee) throw AppError.notFound('Employee not found');
  return models.RelocationCase.create({
    ...payload,
    organization_id: organizationId,
    case_code: payload.case_code || newCaseCode(),
    status: RELOCATION_STATUS.REQUESTED,
    requested_by: requestedBy || null,
  });
}

async function approve({ organizationId, id, approverUserId, note, budgetAmount, budgetCurrency }) {
  const row = await models.RelocationCase.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!row) throw AppError.notFound('Relocation case not found');
  if (row.status !== RELOCATION_STATUS.REQUESTED) {
    throw AppError.conflict('Only requested relocations can be approved');
  }
  row.status = RELOCATION_STATUS.APPROVED;
  row.approved_by = approverUserId;
  row.approved_at = new Date();
  row.approval_note = note || null;
  if (budgetAmount !== undefined && budgetAmount !== null) row.budget_amount = budgetAmount;
  if (budgetCurrency) row.budget_currency = budgetCurrency;
  row.budget_status = RELOCATION_BUDGET_STATUS.APPROVED;
  await row.save();
  return row;
}

const RELO_TRANSITIONS = {
  [RELOCATION_STATUS.REQUESTED]: [RELOCATION_STATUS.APPROVED, RELOCATION_STATUS.CANCELLED],
  [RELOCATION_STATUS.APPROVED]: [RELOCATION_STATUS.IN_PROGRESS, RELOCATION_STATUS.CANCELLED],
  [RELOCATION_STATUS.IN_PROGRESS]: [RELOCATION_STATUS.COMPLETED, RELOCATION_STATUS.CANCELLED],
  [RELOCATION_STATUS.COMPLETED]: [],
  [RELOCATION_STATUS.CANCELLED]: [],
};

async function transition({ organizationId, id, toStatus, actorUserId, actualMoveDate }) {
  const row = await models.RelocationCase.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!row) throw AppError.notFound('Relocation case not found');
  const allowed = RELO_TRANSITIONS[row.status] || [];
  if (!allowed.includes(toStatus)) {
    throw AppError.conflict(`Cannot move a relocation from ${row.status} to ${toStatus}`);
  }
  row.status = toStatus;
  if (toStatus === RELOCATION_STATUS.APPROVED) {
    // Moving to approved via the dropdown records the approver and marks the
    // budget approved, so the approval is not hollow.
    row.approved_by = actorUserId || row.approved_by;
    row.approved_at = row.approved_at || new Date();
    if (row.budget_status === RELOCATION_BUDGET_STATUS.DRAFT) row.budget_status = RELOCATION_BUDGET_STATUS.APPROVED;
  }
  if (toStatus === RELOCATION_STATUS.COMPLETED) {
    row.actual_move_date = actualMoveDate || new Date().toISOString().slice(0, 10);
    row.budget_status = RELOCATION_BUDGET_STATUS.CLOSED;
  }
  await row.save();
  return row;
}

// Recompute spent_amount from expenses that are actually approved/reimbursed.
async function recomputeSpent(relocation, transaction) {
  const expenses = await models.RelocationExpense.findAll({
    where: { relocation_case_id: relocation.id, status: { [require('sequelize').Op.in]: ['approved', 'reimbursed'] } },
    transaction,
  });
  const spent = expenses.reduce((sum, e) => money.add(sum, money.toNumber(e.amount)), 0);
  relocation.spent_amount = spent;
  if (relocation.budget_status !== RELOCATION_BUDGET_STATUS.CLOSED) {
    relocation.budget_status =
      relocation.budget_amount && spent >= money.toNumber(relocation.budget_amount)
        ? RELOCATION_BUDGET_STATUS.EXHAUSTED
        : relocation.budget_status === RELOCATION_BUDGET_STATUS.EXHAUSTED
          ? RELOCATION_BUDGET_STATUS.APPROVED
          : relocation.budget_status;
  }
  await relocation.save({ transaction });
}

async function recordExpense({ organizationId, id, payload }) {
  return sequelize.transaction(async (transaction) => {
    const relocation = await models.RelocationCase.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!relocation) throw AppError.notFound('Relocation case not found');
    if ([RELOCATION_STATUS.CANCELLED].includes(relocation.status)) {
      throw AppError.conflict('Cannot record expenses on a cancelled relocation');
    }

    // Expenses start pending and do not count toward spend until reviewed.
    const expense = await models.RelocationExpense.create(
      {
        ...payload,
        relocation_case_id: id,
      },
      { transaction }
    );
    return expense;
  });
}

async function reviewExpense({ organizationId, relocationId, expenseId, actorUserId, decision, note }) {
  return sequelize.transaction(async (transaction) => {
    const expense = await models.RelocationExpense.findByPk(expenseId, {
      include: [{ model: models.RelocationCase, as: 'relocation_case' }],
      transaction,
    });
    if (!expense || expense.relocation_case.organization_id !== organizationId) {
      throw AppError.notFound('Expense not found');
    }
    if (relocationId && expense.relocation_case_id !== relocationId) {
      throw AppError.notFound('Expense does not belong to this relocation');
    }
    if (!['approved', 'rejected', 'reimbursed'].includes(decision)) {
      throw AppError.badRequest('Invalid decision');
    }
    expense.status = decision;
    expense.reviewed_by = actorUserId;
    expense.reviewed_at = new Date();
    if (note) expense.note = note;
    await expense.save({ transaction });

    // Recompute spend from approved/reimbursed expenses so a rejection does not
    // leave the budget inflated.
    await recomputeSpent(expense.relocation_case, transaction);
    return expense;
  });
}

module.exports = { request, approve, transition, recordExpense, reviewExpense };
