'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const timeOff = require('../services/timeOff.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.time_off_type_id) where.time_off_type_id = req.query.time_off_type_id;
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await models.TimeOffAllocation.findAndCountAll({
    where,
    order: [['valid_from', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.TimeOffType, as: 'time_off_type' },
    ],
  });

  const enriched = rows.map((row) => {
    const json = row.toJSON();
    json.remaining_amount = Number(row.allocated_amount || 0) - Number(row.taken_amount || 0) - Number(row.pending_amount || 0);
    return json;
  });
  return success(res, enriched, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.TimeOffAllocation.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.TimeOffType, as: 'time_off_type' },
    ],
  });
  if (!row) throw AppError.notFound('Allocation not found');
  const json = row.toJSON();
  json.remaining_amount = Number(row.allocated_amount || 0) - Number(row.taken_amount || 0) - Number(row.pending_amount || 0);
  return success(res, json);
}

async function create(req, res) {
  const row = await timeOff.createAllocation({
    organizationId: req.user.organizationId,
    payload: req.body,
    actorUserId: req.user.id,
  });
  return created(res, row);
}

async function approve(req, res) {
  const row = await timeOff.approveAllocation({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approverUserId: req.user.id,
  });
  return success(res, row);
}

async function refuse(req, res) {
  const row = await timeOff.refuseAllocation({
    organizationId: req.user.organizationId,
    id: req.params.id,
  });
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.TimeOffAllocation.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Allocation not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, approve, refuse, remove };
