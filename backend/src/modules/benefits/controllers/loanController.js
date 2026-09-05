'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const loanService = require('../services/loan.service');

async function listPrograms(req, res) {
  const rows = await models.LoanProgram.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['name', 'ASC']],
  });
  return success(res, rows);
}

async function createProgram(req, res) {
  const row = await models.LoanProgram.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function updateProgram(req, res) {
  const row = await models.LoanProgram.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Loan program not found');
  await row.update(req.body);
  return success(res, row);
}

async function removeProgram(req, res) {
  const row = await models.LoanProgram.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Loan program not found');
  await row.destroy();
  return noContent(res);
}

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  const { rows, count } = await models.Loan.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.LoanProgram, as: 'program' },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.Loan.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.LoanProgram, as: 'program' },
      { model: models.LoanRepayment, as: 'repayments' },
    ],
  });
  if (!row) throw AppError.notFound('Loan not found');
  return success(res, row);
}

async function apply(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await loanService.apply({
    organizationId: req.user.organizationId,
    employeeId,
    loanProgramId: req.body.loan_program_id,
    requestedAmount: req.body.requested_amount,
    tenureMonths: req.body.tenure_months,
    reason: req.body.reason,
  });
  return created(res, row);
}

async function managerReview(req, res) {
  const row = await loanService.managerReview({
    organizationId: req.user.organizationId,
    id: req.params.id,
    managerUserId: req.user.id,
    decidedAmount: req.body.decided_amount,
    note: req.body.note,
    approve: req.body.approve !== false,
  });
  return success(res, row);
}

async function adminReview(req, res) {
  const row = await loanService.adminReview({
    organizationId: req.user.organizationId,
    id: req.params.id,
    adminUserId: req.user.id,
    approve: req.body.approve !== false,
    note: req.body.note,
  });
  return success(res, row);
}

async function disburse(req, res) {
  const row = await loanService.disburse({
    organizationId: req.user.organizationId,
    id: req.params.id,
    disburserUserId: req.user.id,
  });
  return success(res, row);
}

async function recordRepayment(req, res) {
  const row = await loanService.recordRepayment({
    organizationId: req.user.organizationId,
    id: req.params.id,
    mode: req.body.mode,
    amount: req.body.amount,
    currency: req.body.currency,
    payslipId: req.body.payslip_id,
    externalReference: req.body.external_reference,
    note: req.body.note,
  });
  return created(res, row);
}

module.exports = {
  listPrograms,
  createProgram,
  updateProgram,
  removeProgram,
  list,
  getOne,
  apply,
  managerReview,
  adminReview,
  disburse,
  recordRepayment,
};
