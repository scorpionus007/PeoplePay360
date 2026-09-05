'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.category) where.category = req.query.category;
  if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';
  const rows = await models.BenefitProvider.findAll({ where, order: [['name', 'ASC']] });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.BenefitProvider.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.BenefitPlan, as: 'plans' }],
  });
  if (!row) throw AppError.notFound('Provider not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.BenefitProvider.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.BenefitProvider.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Provider not found');
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.BenefitProvider.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Provider not found');
  const planCount = await models.BenefitPlan.count({ where: { provider_id: row.id } });
  if (planCount > 0) throw AppError.conflict('Cannot delete a provider that still has plans; reassign or remove them first');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
