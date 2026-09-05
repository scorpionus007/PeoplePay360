'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const relocation = require('../services/relocation.service');

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  const rows = await models.RelocationCase.findAll({
    where,
    order: [['created_at', 'DESC']],
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.MobilityPartner, as: 'partner', attributes: ['id', 'name'] },
    ],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.RelocationCase.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.MobilityPartner, as: 'partner' },
      { model: models.RelocationExpense, as: 'expenses' },
    ],
    order: [[{ model: models.RelocationExpense, as: 'expenses' }, 'incurred_on', 'DESC']],
  });
  if (!row) throw AppError.notFound('Relocation case not found');
  return success(res, row);
}

async function request(req, res) {
  const row = await relocation.request({
    organizationId: req.user.organizationId,
    requestedBy: req.user.id,
    payload: req.body,
  });
  return created(res, row);
}

async function approve(req, res) {
  const row = await relocation.approve({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approverUserId: req.user.id,
    note: req.body.note,
    budgetAmount: req.body.budget_amount,
    budgetCurrency: req.body.budget_currency,
  });
  return success(res, row);
}

async function transition(req, res) {
  const row = await relocation.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: req.body.status,
    actorUserId: req.user.id,
    actualMoveDate: req.body.actual_move_date,
  });
  return success(res, row);
}

async function addExpense(req, res) {
  const row = await relocation.recordExpense({
    organizationId: req.user.organizationId,
    id: req.params.id,
    payload: req.body,
  });
  return created(res, row);
}

async function reviewExpense(req, res) {
  const row = await relocation.reviewExpense({
    organizationId: req.user.organizationId,
    relocationId: req.params.id,
    expenseId: req.params.expenseId,
    actorUserId: req.user.id,
    decision: req.body.decision,
    note: req.body.note,
  });
  return success(res, row);
}

module.exports = { list, getOne, request, approve, transition, addExpense, reviewExpense };
