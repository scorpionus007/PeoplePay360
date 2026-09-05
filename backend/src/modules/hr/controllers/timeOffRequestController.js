'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const timeOff = require('../services/timeOff.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.time_off_type_id) where.time_off_type_id = req.query.time_off_type_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.from && req.query.to) {
    where[Op.and] = [
      { start_date: { [Op.lte]: req.query.to } },
      { end_date: { [Op.gte]: req.query.from } },
    ];
  }

  const { rows, count } = await models.TimeOffRequest.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.TimeOffType, as: 'time_off_type' },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.TimeOffRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.TimeOffType, as: 'time_off_type' },
      { model: models.TimeOffAllocation, as: 'allocation' },
    ],
  });
  if (!row) throw AppError.notFound('Time off request not found');
  return success(res, row);
}

async function submit(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await timeOff.submitRequest({
    organizationId: req.user.organizationId,
    employeeId,
    payload: req.body,
  });
  return created(res, row);
}

async function approve(req, res) {
  const row = await timeOff.approveRequest({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approverUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function refuse(req, res) {
  const row = await timeOff.refuseRequest({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approverUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function cancel(req, res) {
  const row = await timeOff.cancelRequest({
    organizationId: req.user.organizationId,
    id: req.params.id,
    actorUserId: req.user.id,
  });
  return success(res, row);
}

module.exports = { list, getOne, submit, approve, refuse, cancel };
