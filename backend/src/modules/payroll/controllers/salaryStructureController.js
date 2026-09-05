'use strict';

const { Op } = require('sequelize');
const { models, sequelize } = require('../../../models');
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
  if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';

  const { rows, count } = await models.SalaryStructure.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [{ model: models.SalaryStructureRule, as: 'structure_rules' }],
  });

  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const structure = await models.SalaryStructure.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      {
        model: models.SalaryStructureRule,
        as: 'structure_rules',
        include: [{ model: models.SalaryRule, as: 'rule' }],
      },
    ],
    order: [[{ model: models.SalaryStructureRule, as: 'structure_rules' }, 'sequence', 'ASC']],
  });
  if (!structure) throw AppError.notFound('Salary structure not found');
  return success(res, structure);
}

async function create(req, res) {
  const payload = { ...req.body, organization_id: req.user.organizationId, created_by: req.user.id };
  const structure = await models.SalaryStructure.create(payload);
  return created(res, structure);
}

async function update(req, res) {
  const structure = await models.SalaryStructure.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!structure) throw AppError.notFound('Salary structure not found');
  await structure.update(req.body);
  return success(res, structure);
}

async function remove(req, res) {
  const structure = await models.SalaryStructure.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!structure) throw AppError.notFound('Salary structure not found');
  await structure.destroy();
  return noContent(res);
}

async function setRules(req, res) {
  const structure = await models.SalaryStructure.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!structure) throw AppError.notFound('Salary structure not found');
  const rules = req.body.rules || [];

  await sequelize.transaction(async (transaction) => {
    await models.SalaryStructureRule.destroy({
      where: { salary_structure_id: structure.id },
      transaction,
    });
    for (const item of rules) {
      await models.SalaryStructureRule.create(
        {
          salary_structure_id: structure.id,
          salary_rule_id: item.salary_rule_id,
          sequence: item.sequence || 100,
          override_amount: item.override_amount ?? null,
          override_percent: item.override_percent ?? null,
          is_active: item.is_active !== false,
        },
        { transaction }
      );
    }
  });

  return getOne(req, res);
}

module.exports = { list, getOne, create, update, remove, setRules };
