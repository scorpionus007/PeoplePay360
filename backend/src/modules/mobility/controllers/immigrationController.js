'use strict';

const crypto = require('crypto');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { IMMIGRATION_CASE_STATUS } = require('../../../config/constants');

function newCaseCode() {
  return `IM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.case_type) where.case_type = req.query.case_type;
  const rows = await models.ImmigrationCase.findAll({
    where,
    order: [['opened_at', 'DESC']],
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.MobilityPartner, as: 'partner', attributes: ['id', 'name'] },
    ],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.ImmigrationCase.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.MobilityPartner, as: 'partner' },
    ],
  });
  if (!row) throw AppError.notFound('Immigration case not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.ImmigrationCase.create({
    ...req.body,
    organization_id: req.user.organizationId,
    case_code: req.body.case_code || newCaseCode(),
    status: IMMIGRATION_CASE_STATUS.OPEN,
    opened_at: new Date(),
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.ImmigrationCase.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Immigration case not found');
  await row.update(req.body);
  return success(res, row);
}

async function resolve(req, res) {
  const row = await models.ImmigrationCase.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Immigration case not found');
  row.status = IMMIGRATION_CASE_STATUS.RESOLVED;
  row.resolved_at = new Date();
  if (req.body.summary) row.summary = req.body.summary;
  await row.save();
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.ImmigrationCase.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Immigration case not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, resolve, remove };
