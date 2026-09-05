'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const deviceService = require('../services/device.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.category) where.category = req.query.category;
  if (req.query.ownership) where.ownership = req.query.ownership;
  if (req.query.os_family) where.os_family = req.query.os_family;
  if (req.query.assigned_employee_id) where.assigned_employee_id = req.query.assigned_employee_id;
  if (req.query.search) {
    where[Op.or] = [
      { asset_tag: { [Op.iLike]: `%${req.query.search}%` } },
      { hostname: { [Op.iLike]: `%${req.query.search}%` } },
      { serial_number: { [Op.iLike]: `%${req.query.search}%` } },
      { model: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }

  const { rows, count } = await models.Device.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      {
        model: models.Employee,
        as: 'assigned_employee',
        attributes: ['id', 'first_name', 'last_name', 'employee_number'],
      },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.Device.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'assigned_employee' },
      { model: models.DeviceAssignment, as: 'assignments' },
      {
        model: models.DeviceSoftware,
        as: 'software_installs',
        include: [{ model: models.SoftwareCatalogItem, as: 'software' }],
      },
      {
        model: models.DeviceBaselineCheck,
        as: 'baseline_checks',
        include: [{ model: models.BaselineControl, as: 'control' }],
      },
    ],
  });
  if (!row) throw AppError.notFound('Device not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.Device.create({ ...req.body, organization_id: req.user.organizationId });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.Device.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Device not found');
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.Device.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Device not found');
  await row.destroy();
  return noContent(res);
}

async function assign(req, res) {
  const result = await deviceService.assignToEmployee({
    organizationId: req.user.organizationId,
    deviceId: req.params.id,
    employeeId: req.body.employee_id,
    assignedBy: req.user.id,
    checkoutCondition: req.body.checkout_condition,
    note: req.body.note,
  });
  return success(res, result);
}

async function unassign(req, res) {
  const result = await deviceService.unassign({
    organizationId: req.user.organizationId,
    deviceId: req.params.id,
    returnedBy: req.user.id,
    returnCondition: req.body.return_condition,
    note: req.body.note,
  });
  return success(res, result);
}

module.exports = { list, getOne, create, update, remove, assign, unassign };
