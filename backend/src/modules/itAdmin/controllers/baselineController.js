'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const baseline = require('../services/baseline.service');

async function listControls(req, res) {
  const rows = await models.BaselineControl.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['category', 'ASC'], ['code', 'ASC']],
  });
  return success(res, rows);
}

async function getControl(req, res) {
  const row = await models.BaselineControl.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Baseline control not found');
  return success(res, row);
}

async function createControl(req, res) {
  const row = await models.BaselineControl.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function updateControl(req, res) {
  const row = await models.BaselineControl.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Baseline control not found');
  await row.update(req.body);
  return success(res, row);
}

async function removeControl(req, res) {
  const row = await models.BaselineControl.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Baseline control not found');
  await row.destroy();
  return noContent(res);
}

async function reportCheck(req, res) {
  const row = await baseline.upsertCheck({
    organizationId: req.user.organizationId,
    deviceId: req.params.deviceId,
    baselineControlId: req.body.baseline_control_id,
    status: req.body.status,
    evidence: req.body.evidence,
    note: req.body.remediation_note,
    source: req.body.source,
  });
  return success(res, row);
}

async function devicePosture(req, res) {
  const posture = await baseline.postureForDevice({
    organizationId: req.user.organizationId,
    deviceId: req.params.deviceId,
  });
  return success(res, posture);
}

async function orgPosture(req, res) {
  const posture = await baseline.orgPosture({ organizationId: req.user.organizationId });
  return success(res, posture);
}

module.exports = {
  listControls,
  getControl,
  createControl,
  updateControl,
  removeControl,
  reportCheck,
  devicePosture,
  orgPosture,
};
