'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const { HR_REQUEST_STATUS, CHAT_SENDER_TYPE } = require('../../../config/constants');
const { hasRole } = require('../../../middleware/rbac');
const { ROLES } = require('../../../config/constants');

function isHrSide(user) {
  return hasRole(user, ROLES.HR) || hasRole(user, ROLES.HR_MANAGER) || hasRole(user, ROLES.ADMIN);
}

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };

  // Employees only see their own requests unless they are HR side.
  if (!isHrSide(req.user)) {
    if (!req.user.employeeId) throw AppError.forbidden('No employee record linked to this user');
    where.employee_id = req.user.employeeId;
  } else {
    if (req.query.employee_id) where.employee_id = req.query.employee_id;
    if (req.query.assigned_to) where.assigned_to = req.query.assigned_to;
  }
  if (req.query.status) where.status = req.query.status;
  if (req.query.request_type) where.request_type = req.query.request_type;

  const { rows, count } = await models.HRRequest.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      {
        model: models.Employee,
        as: 'employee',
        attributes: ['id', 'first_name', 'last_name', 'employee_number'],
      },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.HRRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.HRRequestMessage, as: 'messages' },
    ],
    order: [[{ model: models.HRRequestMessage, as: 'messages' }, 'created_at', 'ASC']],
  });
  if (!row) throw AppError.notFound('HR request not found');
  if (!isHrSide(req.user) && row.employee_id !== req.user.employeeId) {
    throw AppError.forbidden('You cannot view this request');
  }
  return success(res, row);
}

async function create(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await models.HRRequest.create({
    organization_id: req.user.organizationId,
    employee_id: employeeId,
    request_type: req.body.request_type || 'general',
    subject: req.body.subject,
    body: req.body.body,
    priority: req.body.priority || 'normal',
    status: HR_REQUEST_STATUS.OPEN,
  });
  return created(res, row);
}

async function reply(req, res) {
  const row = await models.HRRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('HR request not found');
  if (!isHrSide(req.user) && row.employee_id !== req.user.employeeId) {
    throw AppError.forbidden('You cannot reply to this request');
  }

  const senderType = isHrSide(req.user) ? CHAT_SENDER_TYPE.HR : CHAT_SENDER_TYPE.EMPLOYEE;
  const message = await models.HRRequestMessage.create({
    hr_request_id: row.id,
    sender_user_id: req.user.id,
    sender_type: senderType,
    body: req.body.body,
    internal_note: !!req.body.internal_note && isHrSide(req.user),
  });

  if (isHrSide(req.user) && row.status === HR_REQUEST_STATUS.OPEN) {
    row.status = HR_REQUEST_STATUS.IN_PROGRESS;
    if (req.body.assign_to_self) row.assigned_to = req.user.id;
    await row.save();
  }

  return created(res, message);
}

async function updateStatus(req, res) {
  const row = await models.HRRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('HR request not found');
  if (!isHrSide(req.user)) throw AppError.forbidden();
  row.status = req.body.status;
  if (req.body.status === HR_REQUEST_STATUS.RESOLVED) {
    row.resolved_at = new Date();
    row.resolution_note = req.body.resolution_note || row.resolution_note;
  }
  await row.save();
  return success(res, row);
}

module.exports = { list, getOne, create, reply, updateStatus };
