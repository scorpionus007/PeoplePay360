'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const advance = require('../services/advanceSalary.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;

  const { rows, count } = await models.AdvanceSalaryRequest.findAndCountAll({
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
  const request = await models.AdvanceSalaryRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.AdvanceSalaryRepayment, as: 'repayments' },
    ],
  });
  if (!request) throw AppError.notFound('Advance salary request not found');
  return success(res, request);
}

function canActForOthers(req) {
  return (req.user.roles || []).includes('admin') || (req.user.permissions || []).includes('advance.salary.approve');
}

async function request(req, res) {
  const { employee_id, requested_amount, repayment_mode, emi_months, reason } = req.body;
  // Self-service requesters can only file for themselves; only an approver may
  // file on behalf of another employee.
  const employeeId = canActForOthers(req) && employee_id ? employee_id : req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee context for the advance request');
  const created_request = await advance.createRequest({
    organizationId: req.user.organizationId,
    employeeId,
    requestedAmount: requested_amount,
    reason,
    repaymentMode: repayment_mode,
    emiMonths: emi_months,
  });
  return created(res, created_request);
}

async function approve(req, res) {
  const request = await advance.approve({
    id: req.params.id,
    organizationId: req.user.organizationId,
    approvedAmount: req.body.approved_amount,
    approvedBy: req.user.id,
  });
  return success(res, request);
}

async function reject(req, res) {
  const request = await advance.reject({ id: req.params.id, organizationId: req.user.organizationId });
  return success(res, request);
}

async function disburse(req, res) {
  const request = await advance.markDisbursed({
    id: req.params.id,
    organizationId: req.user.organizationId,
    disbursedBy: req.user.id,
    externalReference: req.body.external_reference,
  });
  return success(res, request);
}

async function recordRepayment(req, res) {
  const result = await advance.recordRepayment({
    id: req.params.id,
    organizationId: req.user.organizationId,
    mode: req.body.mode,
    amount: req.body.amount,
    currency: req.body.currency,
    payslipId: req.body.payslip_id,
    externalReference: req.body.external_reference,
    note: req.body.note,
  });
  return created(res, result);
}

async function convertToEmi(req, res) {
  const request = await advance.convertToEmi({
    id: req.params.id,
    organizationId: req.user.organizationId,
    emiMonths: req.body.emi_months,
  });
  return success(res, request);
}

module.exports = { list, getOne, request, approve, reject, disburse, recordRepayment, convertToEmi };
