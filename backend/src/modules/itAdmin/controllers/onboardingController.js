'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const onboarding = require('../services/onboarding.service');

async function listKits(req, res) {
  const rows = await models.OnboardingKit.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['is_default', 'DESC'], ['name', 'ASC']],
  });
  return success(res, rows);
}

async function getKit(req, res) {
  const row = await models.OnboardingKit.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Onboarding kit not found');
  return success(res, row);
}

async function createKit(req, res) {
  const row = await models.OnboardingKit.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function updateKit(req, res) {
  const row = await models.OnboardingKit.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Onboarding kit not found');
  await row.update(req.body);
  return success(res, row);
}

async function removeKit(req, res) {
  const row = await models.OnboardingKit.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Onboarding kit not found');
  await row.destroy();
  return noContent(res);
}

async function listProvisions(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;

  const rows = await models.OnboardingProvision.findAll({
    where,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: models.Employee,
        as: 'employee',
        attributes: ['id', 'first_name', 'last_name', 'employee_number'],
      },
      { model: models.OnboardingKit, as: 'kit' },
      { model: models.Device, as: 'device' },
    ],
  });
  return success(res, rows);
}

async function provision(req, res) {
  const row = await onboarding.provision({
    organizationId: req.user.organizationId,
    employeeId: req.body.employee_id,
    onboardingKitId: req.body.onboarding_kit_id,
    deviceId: req.body.device_id || null,
    shippingAddress: req.body.shipping_address,
    estimatedReadyDate: req.body.estimated_ready_date,
    requestedBy: req.user.id,
    note: req.body.note,
  });
  return created(res, row);
}

async function advanceStatus(req, res) {
  const row = await onboarding.advanceStatus({
    organizationId: req.user.organizationId,
    id: req.params.id,
    status: req.body.status,
    deviceId: req.body.device_id,
    actorUserId: req.user.id,
  });
  return success(res, row);
}

module.exports = {
  listKits,
  getKit,
  createKit,
  updateKit,
  removeKit,
  listProvisions,
  provision,
  advanceStatus,
};
