'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const salaryChange = require('../services/salaryChange.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;

  const { rows, count } = await models.SalaryChangeRequest.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const request = await models.SalaryChangeRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.Contract, as: 'current_contract' },
      { model: models.Contract, as: 'applied_contract' },
    ],
  });
  if (!request) throw AppError.notFound('Salary change request not found');
  return success(res, request);
}

async function suggest(req, res) {
  const { employee_id, change_type, amount, percent, reason, effective_from } = req.body;
  const request = await salaryChange.suggest({
    organizationId: req.user.organizationId,
    employeeId: employee_id,
    changeType: change_type,
    amount,
    percent,
    reason,
    effectiveFrom: effective_from,
    suggestedBy: req.user.id,
  });
  return created(res, request);
}

async function payrollDecide(req, res) {
  const request = await salaryChange.payrollDecide({
    id: req.params.id,
    payrollReviewerId: req.user.id,
    decidedAmount: req.body.decided_amount,
    note: req.body.note,
  });
  return success(res, request);
}

async function adminApprove(req, res) {
  const request = await salaryChange.adminApprove({
    id: req.params.id,
    adminReviewerId: req.user.id,
    note: req.body.note,
  });
  return success(res, request);
}

async function reject(req, res) {
  const request = await salaryChange.reject({
    id: req.params.id,
    adminReviewerId: req.user.id,
    note: req.body.note,
  });
  return success(res, request);
}

async function apply(req, res) {
  const result = await salaryChange.apply({ id: req.params.id, actorUserId: req.user.id });
  return success(res, result);
}

module.exports = { list, getOne, suggest, payrollDecide, adminApprove, reject, apply };
