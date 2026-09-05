'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  // HR authors (with write permission) see everything, including drafts and
  // scheduled/expired items. Everyone else sees only the live published feed.
  const isHrSide = (req.user.roles || []).includes('admin') || (req.user.permissions || []).includes('hr.request.write');
  if (!isHrSide) {
    const now = new Date();
    where.status = 'published';
    where[Op.and] = [
      { [Op.or]: [{ publish_at: null }, { publish_at: { [Op.lte]: now } }] },
      { [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }] },
    ];
  }
  const rows = await models.HRAnnouncement.findAll({
    where,
    order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
  });
  return success(res, rows);
}

async function create(req, res) {
  const row = await models.HRAnnouncement.create({
    ...req.body,
    organization_id: req.user.organizationId,
    published_by: req.user.id,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.HRAnnouncement.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Announcement not found');
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.HRAnnouncement.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Announcement not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, create, update, remove };
