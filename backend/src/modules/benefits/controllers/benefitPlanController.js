'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.category) where.category = req.query.category;
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${req.query.search}%` } },
      { code: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }
  const { rows, count } = await models.BenefitPlan.findAndCountAll({
    where,
    order: [['category', 'ASC'], ['name', 'ASC']],
    limit,
    offset,
    include: [{ model: models.BenefitProvider, as: 'provider' }],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.BenefitPlan.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.BenefitProvider, as: 'provider' },
      { model: models.BenefitEnrollment, as: 'enrollments' },
    ],
  });
  if (!row) throw AppError.notFound('Plan not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.BenefitPlan.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.BenefitPlan.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Plan not found');
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.BenefitPlan.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Plan not found');
  const [enrollmentCount, claimCount] = await Promise.all([
    models.BenefitEnrollment.count({ where: { benefit_plan_id: row.id } }),
    models.BenefitClaim.count({ where: { benefit_plan_id: row.id } }),
  ]);
  if (enrollmentCount > 0 || claimCount > 0) {
    throw AppError.conflict('Cannot delete a plan with existing enrollments or claims; archive it instead');
  }
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
