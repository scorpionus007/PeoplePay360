'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const referralService = require('../services/referral.service');
const { hasRole } = require('../../../middleware/rbac');
const { ROLES } = require('../../../config/constants');

function isRecruiter(user) {
  return (
    hasRole(user, ROLES.TALENT_ACQUISITION_LEAD) ||
    hasRole(user, ROLES.HR_MANAGER) ||
    hasRole(user, ROLES.HR) ||
    hasRole(user, ROLES.ADMIN)
  );
}

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (!isRecruiter(req.user)) {
    if (!req.user.employeeId) throw AppError.forbidden('No employee record linked to this user');
    where.referrer_employee_id = req.user.employeeId;
  } else if (req.query.referrer_employee_id) {
    where.referrer_employee_id = req.query.referrer_employee_id;
  }
  if (req.query.status) where.status = req.query.status;
  if (req.query.requisition_id) where.requisition_id = req.query.requisition_id;
  const rows = await models.Referral.findAll({
    where,
    order: [['created_at', 'DESC']],
    include: [
      { model: models.Employee, as: 'referrer', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.Requisition, as: 'requisition', attributes: ['id', 'code', 'title'] },
      { model: models.Candidate, as: 'candidate', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.Referral.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'referrer' },
      { model: models.Requisition, as: 'requisition' },
      { model: models.Candidate, as: 'candidate' },
      { model: models.Application, as: 'applications' },
    ],
  });
  if (!row) throw AppError.notFound('Referral not found');
  if (!isRecruiter(req.user) && row.referrer_employee_id !== req.user.employeeId) {
    throw AppError.forbidden();
  }
  return success(res, row);
}

async function submit(req, res) {
  // A referrer can only attribute a referral to themselves; a recruiter may
  // attribute it to another employee.
  const canActForOthers = (req.user.roles || []).includes('admin') || (req.user.permissions || []).includes('referral.write');
  const referrer = canActForOthers && req.body.referrer_employee_id ? req.body.referrer_employee_id : req.user.employeeId;
  if (!referrer) throw AppError.badRequest('No referrer employee associated');
  const row = await referralService.submit({
    organizationId: req.user.organizationId,
    referrerEmployeeId: referrer,
    payload: req.body,
  });
  return created(res, row);
}

async function review(req, res) {
  const row = await referralService.review({
    organizationId: req.user.organizationId,
    id: req.params.id,
    reviewerUserId: req.user.id,
    status: req.body.status,
    note: req.body.note,
  });
  return success(res, row);
}

async function markBonusPaid(req, res) {
  const row = await referralService.markBonusPaid({
    organizationId: req.user.organizationId,
    id: req.params.id,
    amount: req.body.amount,
    currency: req.body.currency,
  });
  return success(res, row);
}

module.exports = { list, getOne, submit, review, markBonusPaid };
