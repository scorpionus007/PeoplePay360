'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');

async function getMine(req, res) {
  const org = await models.Organization.findByPk(req.user.organizationId);
  if (!org) throw AppError.notFound('Organization not found');
  return success(res, org);
}

async function update(req, res) {
  const org = await models.Organization.findByPk(req.user.organizationId);
  if (!org) throw AppError.notFound('Organization not found');
  await org.update(req.body);
  return success(res, org);
}

async function create(req, res) {
  // Admin bootstrap only. In production this would live behind a platform admin surface.
  const org = await models.Organization.create(req.body);
  return created(res, org);
}

module.exports = { getMine, update, create };
