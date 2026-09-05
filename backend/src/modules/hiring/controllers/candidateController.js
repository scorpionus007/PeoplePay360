'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.is_blacklisted !== undefined) where.is_blacklisted = req.query.is_blacklisted === 'true';
  if (req.query.search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${req.query.search}%` } },
      { last_name: { [Op.iLike]: `%${req.query.search}%` } },
      { email: { [Op.iLike]: `%${req.query.search}%` } },
      { current_company: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }
  const { rows, count } = await models.Candidate.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.Candidate.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.Application, as: 'applications' }],
  });
  if (!row) throw AppError.notFound('Candidate not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.Candidate.create({
    ...req.body,
    email: String(req.body.email || '').toLowerCase(),
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.Candidate.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Candidate not found');
  const patch = { ...req.body };
  if (patch.email) patch.email = String(patch.email).toLowerCase();
  await row.update(patch);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.Candidate.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Candidate not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
