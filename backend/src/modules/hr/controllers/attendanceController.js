'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const attendanceService = require('../services/attendance.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.from && req.query.to) where.work_date = { [Op.between]: [req.query.from, req.query.to] };
  else if (req.query.from) where.work_date = { [Op.gte]: req.query.from };
  else if (req.query.to) where.work_date = { [Op.lte]: req.query.to };

  const { rows, count } = await models.Attendance.findAndCountAll({
    where,
    order: [['work_date', 'DESC'], ['check_in', 'DESC']],
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
  const row = await models.Attendance.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.Employee, as: 'employee' }],
  });
  if (!row) throw AppError.notFound('Attendance record not found');
  return success(res, row);
}

async function checkIn(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await attendanceService.checkIn({
    organizationId: req.user.organizationId,
    employeeId,
    at: req.body.at,
    source: req.body.source,
    ip: req.ip,
    lat: req.body.lat,
    lng: req.body.lng,
  });
  return created(res, row);
}

async function checkOut(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await attendanceService.checkOut({
    organizationId: req.user.organizationId,
    employeeId,
    at: req.body.at,
    ip: req.ip,
    lat: req.body.lat,
    lng: req.body.lng,
  });
  return success(res, row);
}

async function correct(req, res) {
  const row = await attendanceService.correct({
    organizationId: req.user.organizationId,
    id: req.params.id,
    correctorUserId: req.user.id,
    patch: req.body.patch || {},
    note: req.body.note,
  });
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.Attendance.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Attendance record not found');
  await row.destroy();
  return noContent(res);
}

async function summary(req, res) {
  const from = req.query.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const totals = await attendanceService.summary({
    organizationId: req.user.organizationId,
    employeeId: req.query.employee_id || null,
    from,
    to,
  });
  return success(res, { from, to, totals });
}

module.exports = { list, getOne, checkIn, checkOut, correct, remove, summary };
