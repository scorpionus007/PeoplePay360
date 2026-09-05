'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const enrollment = require('../services/enrollment.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.plan_id) where.benefit_plan_id = req.query.plan_id;
  const { rows, count } = await models.BenefitEnrollment.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.BenefitPlan, as: 'plan' },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.BenefitEnrollment.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.BenefitPlan, as: 'plan' },
      { model: models.BenefitDependent, as: 'dependents' },
    ],
  });
  if (!row) throw AppError.notFound('Enrollment not found');
  return success(res, row);
}

async function enroll(req, res) {
  const canActForOthers = (req.user.roles || []).includes('admin') || (req.user.permissions || []).includes('benefit.enrollment.approve');
  const employeeId = canActForOthers && req.body.employee_id ? req.body.employee_id : req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await enrollment.enroll({
    organizationId: req.user.organizationId,
    employeeId,
    planId: req.body.benefit_plan_id,
    startDate: req.body.start_date,
    dependents: req.body.dependents || [],
    electedAmount: req.body.elected_amount,
    notes: req.body.notes,
  });
  return created(res, row);
}

async function approve(req, res) {
  const row = await enrollment.approveEnrollment({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approverUserId: req.user.id,
  });
  return success(res, row);
}

async function decline(req, res) {
  const row = await enrollment.declineEnrollment({
    organizationId: req.user.organizationId,
    id: req.params.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function waive(req, res) {
  const row = await enrollment.waive({
    organizationId: req.user.organizationId,
    id: req.params.id,
    reason: req.body.reason,
  });
  return success(res, row);
}

async function terminate(req, res) {
  const row = await enrollment.terminate({
    organizationId: req.user.organizationId,
    id: req.params.id,
    endDate: req.body.end_date,
    reason: req.body.reason,
  });
  return success(res, row);
}

module.exports = { list, getOne, enroll, approve, decline, waive, terminate };
