'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function list(req, res) {
  const rows = await models.HRAnnouncement.findAll({
    where: { organization_id: req.user.organizationId },
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
