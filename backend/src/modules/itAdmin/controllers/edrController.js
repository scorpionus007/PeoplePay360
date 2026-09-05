'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');

async function listIntegrations(req, res) {
  const rows = await models.EdrIntegration.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['credentials_ref'] },
  });
  return success(res, rows);
}

async function getIntegration(req, res) {
  const row = await models.EdrIntegration.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    attributes: { exclude: ['credentials_ref'] },
  });
  if (!row) throw AppError.notFound('EDR integration not found');
  return success(res, row);
}

async function createIntegration(req, res) {
  const row = await models.EdrIntegration.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  const clean = row.toJSON();
  delete clean.credentials_ref;
  return created(res, clean);
}

async function updateIntegration(req, res) {
  const row = await models.EdrIntegration.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('EDR integration not found');
  await row.update(req.body);
  const clean = row.toJSON();
  delete clean.credentials_ref;
  return success(res, clean);
}

async function removeIntegration(req, res) {
  const row = await models.EdrIntegration.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('EDR integration not found');
  await row.destroy();
  return noContent(res);
}

async function ingestEvent(req, res) {
  const integration = await models.EdrIntegration.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!integration) throw AppError.notFound('EDR integration not found');

  const event = await models.EdrEvent.create({
    organization_id: req.user.organizationId,
    edr_integration_id: integration.id,
    device_id: req.body.device_id || null,
    external_event_id: req.body.external_event_id || null,
    event_type: req.body.event_type,
    severity: req.body.severity || 'info',
    occurred_at: req.body.occurred_at ? new Date(req.body.occurred_at) : new Date(),
    title: req.body.title || null,
    summary: req.body.summary || null,
    raw_payload: req.body.raw_payload || {},
  });

  integration.last_synced_at = new Date();
  if (integration.status !== 'connected') integration.status = 'connected';
  await integration.save();

  return created(res, event);
}

async function listEvents(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.severity) where.severity = req.query.severity;
  if (req.query.status) where.status = req.query.status;
  if (req.query.device_id) where.device_id = req.query.device_id;
  if (req.query.from) where.occurred_at = { [Op.gte]: new Date(req.query.from) };
  if (req.query.to) where.occurred_at = { ...(where.occurred_at || {}), [Op.lte]: new Date(req.query.to) };

  const { rows, count } = await models.EdrEvent.findAndCountAll({
    where,
    order: [['occurred_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.EdrIntegration, as: 'integration', attributes: ['id', 'vendor', 'display_name'] },
      { model: models.Device, as: 'device', attributes: ['id', 'asset_tag', 'hostname'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function updateEventStatus(req, res) {
  const row = await models.EdrEvent.findOne({
    where: { id: req.params.eventId, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Event not found');
  row.status = req.body.status;
  if (req.body.assigned_to !== undefined) row.assigned_to = req.body.assigned_to;
  if (['resolved', 'false_positive'].includes(req.body.status)) row.resolved_at = new Date();
  await row.save();
  return success(res, row);
}

module.exports = {
  listIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  removeIntegration,
  ingestEvent,
  listEvents,
  updateEventStatus,
};
