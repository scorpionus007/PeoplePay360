'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${req.query.search}%` } },
      { code: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.category) where.category = req.query.category;
  if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';

  const { rows, count } = await models.SalaryRule.findAndCountAll({
    where,
    order: [['category', 'ASC'], ['name', 'ASC']],
    limit,
    offset,
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const rule = await models.SalaryRule.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!rule) throw AppError.notFound('Salary rule not found');
  return success(res, rule);
}

async function create(req, res) {
  const payload = { ...req.body, organization_id: req.user.organizationId };
  const rule = await models.SalaryRule.create(payload);
  return created(res, rule);
}

async function update(req, res) {
  const rule = await models.SalaryRule.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!rule) throw AppError.notFound('Salary rule not found');
  await rule.update(req.body);
  return success(res, rule);
}

async function remove(req, res) {
  const rule = await models.SalaryRule.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!rule) throw AppError.notFound('Salary rule not found');
  await rule.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
