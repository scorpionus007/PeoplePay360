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

async function transition({ organizationId, id, toStatus, actorUserId, actualMoveDate }) {
  const row = await models.RelocationCase.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!row) throw AppError.notFound('Relocation case not found');
  if ([RELOCATION_STATUS.COMPLETED, RELOCATION_STATUS.CANCELLED].includes(row.status)) {
    throw AppError.conflict('Case is already in a terminal state');
  }
  row.status = toStatus;
  if (toStatus === RELOCATION_STATUS.COMPLETED) {
    row.actual_move_date = actualMoveDate || new Date().toISOString().slice(0, 10);
    row.budget_status = RELOCATION_BUDGET_STATUS.CLOSED;
  }
  await row.save();
  return row;
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

    const expense = await models.RelocationExpense.create(
      {
        ...payload,
        relocation_case_id: id,
      },
      { transaction }
    );

    const amount = money.toNumber(payload.amount);
    relocation.spent_amount = money.add(money.toNumber(relocation.spent_amount || 0), amount);
    if (
      relocation.budget_amount &&
      relocation.spent_amount >= money.toNumber(relocation.budget_amount) &&
      relocation.budget_status !== RELOCATION_BUDGET_STATUS.CLOSED
    ) {
      relocation.budget_status = RELOCATION_BUDGET_STATUS.EXHAUSTED;
    }
    await relocation.save({ transaction });

    return expense;
  });
}

async function reviewExpense({ organizationId, expenseId, actorUserId, decision, note }) {
  const expense = await models.RelocationExpense.findByPk(expenseId, {
    include: [{ model: models.RelocationCase, as: 'relocation_case' }],
  });
  if (!expense || expense.relocation_case.organization_id !== organizationId) {
    throw AppError.notFound('Expense not found');
  }
  if (!['approved', 'rejected', 'reimbursed'].includes(decision)) {
    throw AppError.badRequest('Invalid decision');
  }
  expense.status = decision;
  expense.reviewed_by = actorUserId;
  expense.reviewed_at = new Date();
  if (note) expense.note = note;
  await expense.save();
  return expense;
}

module.exports = { request, approve, transition, recordExpense, reviewExpense };
