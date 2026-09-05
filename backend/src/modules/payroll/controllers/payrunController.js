'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const payrunService = require('../services/payrun.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.from) where.period_start = { [Op.gte]: req.query.from };
  if (req.query.to) where.period_end = { [Op.lte]: req.query.to };

  const { rows, count } = await models.Payrun.findAndCountAll({
    where,
    order: [['period_end', 'DESC']],
    limit,
    offset,
    include: [{ model: models.SalaryStructure, as: 'salary_structure' }],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const payrun = await models.Payrun.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.SalaryStructure, as: 'salary_structure' },
      {
        model: models.Payslip,
        as: 'payslips',
        include: [{ model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] }],
      },
    ],
    order: [[{ model: models.Payslip, as: 'payslips' }, 'created_at', 'ASC']],
  });
  if (!payrun) throw AppError.notFound('Payrun not found');
  return success(res, payrun);
}

async function eligibleEmployees(req, res) {
  const { period_start: periodStart, period_end: periodEnd } = req.query;
  if (!periodStart || !periodEnd) throw AppError.badRequest('period_start and period_end are required');
  const departmentIds = req.query.department_ids ? String(req.query.department_ids).split(',') : [];
  const employeeTypes = req.query.employee_types ? String(req.query.employee_types).split(',') : [];
  const employees = await payrunService.listEligibleEmployees({
    organizationId: req.user.organizationId,
    periodStart,
    periodEnd,
    departmentIds,
    employeeTypes,
  });
  return success(res, employees);
}

async function create(req, res) {
  const {
    name,
    code,
    salary_structure_id,
    period_start,
    period_end,
    payment_date,
    currency,
    employee_ids,
    department_scope,
    employee_type_scope,
  } = req.body;

  const payrun = await payrunService.createPayrun({
    organizationId: req.user.organizationId,
    name,
    code,
    salaryStructureId: salary_structure_id,
    periodStart: period_start,
    periodEnd: period_end,
    paymentDate: payment_date,
    currency,
    employeeIds: employee_ids,
    departmentScope: department_scope,
    employeeTypeScope: employee_type_scope,
    createdBy: req.user.id,
  });
  return created(res, payrun);
}

async function compute(req, res) {
  const payrun = await payrunService.computePayrun(req.params.id);
  return success(res, payrun);
}

async function validate(req, res) {
  const payrun = await payrunService.validatePayrun({ id: req.params.id, validatedBy: req.user.id });
  return success(res, payrun);
}

async function markPaid(req, res) {
  const payrun = await payrunService.markPaid({ id: req.params.id, releasedBy: req.user.id });
  return success(res, payrun);
}

async function cancel(req, res) {
  const payrun = await models.Payrun.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!payrun) throw AppError.notFound('Payrun not found');
  payrun.status = 'cancelled';
  await payrun.save();
  return success(res, payrun);
}

async function remove(req, res) {
  const payrun = await models.Payrun.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!payrun) throw AppError.notFound('Payrun not found');
  if (!['draft', 'cancelled'].includes(payrun.status)) {
    throw AppError.conflict('Only draft or cancelled payruns can be deleted');
  }
  await payrun.destroy();
  return noContent(res);
}

module.exports = { list, getOne, eligibleEmployees, create, compute, validate, markPaid, cancel, remove };
