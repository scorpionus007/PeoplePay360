'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function list(req, res) {
  const rows = await models.JobBoardIntegration.findAll({
    where: { organization_id: req.user.organizationId },
    attributes: { exclude: ['credentials_ref'] },
    order: [['created_at', 'DESC']],
  });
  return success(res, rows);
}

async function create(req, res) {
  const row = await models.JobBoardIntegration.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  const clean = row.toJSON();
  delete clean.credentials_ref;
  return created(res, clean);
}

async function update(req, res) {
  const row = await models.JobBoardIntegration.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Job board integration not found');
  await row.update(req.body);
  const clean = row.toJSON();
  delete clean.credentials_ref;
  return success(res, clean);
}

async function remove(req, res) {
  const row = await models.JobBoardIntegration.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Job board integration not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, create, update, remove };
