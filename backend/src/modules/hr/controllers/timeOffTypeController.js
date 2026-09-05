'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function list(req, res) {
  const rows = await models.TimeOffType.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['name', 'ASC']],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.TimeOffType.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Time off type not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.TimeOffType.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.TimeOffType.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Time off type not found');
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.TimeOffType.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Time off type not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
