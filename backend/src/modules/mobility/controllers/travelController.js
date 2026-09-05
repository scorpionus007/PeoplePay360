'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const travel = require('../services/travel.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.from) where.depart_date = { [Op.gte]: req.query.from };
  if (req.query.to) where.depart_date = { ...(where.depart_date || {}), [Op.lte]: req.query.to };
  const { rows, count } = await models.TravelRequest.findAndCountAll({
    where,
    order: [['depart_date', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.TravelRequest.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.Employee, as: 'employee' }],
  });
  if (!row) throw AppError.notFound('Travel request not found');
  return success(res, row);
}

async function submit(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await travel.submit({
    organizationId: req.user.organizationId,
    employeeId,
    payload: req.body,
  });
  return created(res, row);
}

async function approve(req, res) {
  const row = await travel.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: 'approved',
    approverUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function reject(req, res) {
  const row = await travel.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: 'rejected',
    approverUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function book(req, res) {
  const row = await travel.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: 'booked',
    bookingReference: req.body.booking_reference,
  });
  return success(res, row);
}

async function complete(req, res) {
  const row = await travel.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: 'completed',
  });
  return success(res, row);
}

async function cancel(req, res) {
  const row = await travel.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: 'cancelled',
  });
  return success(res, row);
}

module.exports = { list, getOne, submit, approve, reject, book, complete, cancel };
