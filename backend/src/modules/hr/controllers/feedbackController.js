'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const feedback = require('../services/feedback.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.category) where.category = req.query.category;
  if (req.query.priority) where.priority = req.query.priority;

  const { rows, count } = await models.FeedbackEntry.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      {
        model: models.Employee,
        as: 'employee',
        attributes: ['id', 'first_name', 'last_name', 'employee_number'],
        required: false,
      },
    ],
  });

  const scrubbed = rows.map((row) => {
    const json = row.toJSON();
    if (json.is_anonymous) {
      json.employee_id = null;
      json.employee = null;
    }
    return json;
  });
  return success(res, scrubbed, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.FeedbackEntry.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.Employee, as: 'employee', required: false }],
  });
  if (!row) throw AppError.notFound('Feedback entry not found');
  const json = row.toJSON();
  if (json.is_anonymous) {
    json.employee_id = null;
    json.employee = null;
  }
  return success(res, json);
}

async function submit(req, res) {
  const row = await feedback.submit({
    organizationId: req.user.organizationId,
    actorEmployeeId: req.user.employeeId,
    payload: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  return created(res, row);
}

async function updateStatus(req, res) {
  const row = await feedback.updateStatus({
    organizationId: req.user.organizationId,
    id: req.params.id,
    status: req.body.status,
    note: req.body.note,
    actorUserId: req.user.id,
  });
  return success(res, row);
}

module.exports = { list, getOne, submit, updateStatus };
