'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { JOB_POSTING_STATUS, REQUISITION_STATUS } = require('../../../config/constants');

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.requisition_id) where.requisition_id = req.query.requisition_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.channel) where.channel = req.query.channel;
  const rows = await models.JobPosting.findAll({
    where,
    order: [['created_at', 'DESC']],
    include: [{ model: models.Requisition, as: 'requisition' }],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.JobPosting.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Requisition, as: 'requisition' },
      { model: models.JobBoardIntegration, as: 'board', attributes: { exclude: ['credentials_ref'] } },
    ],
  });
  if (!row) throw AppError.notFound('Job posting not found');
  return success(res, row);
}

async function create(req, res) {
  const requisition = await models.Requisition.findOne({
    where: { id: req.body.requisition_id, organization_id: req.user.organizationId },
  });
  if (!requisition) throw AppError.notFound('Requisition not found');
  if (requisition.status !== REQUISITION_STATUS.APPROVED) {
    throw AppError.conflict('Requisition must be approved before creating a posting');
  }
  const row = await models.JobPosting.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.JobPosting.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Job posting not found');
  await row.update(req.body);
  return success(res, row);
}

async function publish(req, res) {
  const row = await models.JobPosting.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Job posting not found');
  if (row.status === JOB_POSTING_STATUS.PUBLISHED) return success(res, row);
  row.status = JOB_POSTING_STATUS.PUBLISHED;
  row.published_at = new Date();
  await row.save();
  return success(res, row);
}

async function close(req, res) {
  const row = await models.JobPosting.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Job posting not found');
  row.status = JOB_POSTING_STATUS.CLOSED;
  row.closed_at = new Date();
  await row.save();
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.JobPosting.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Job posting not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, publish, close, remove };
