'use strict';

const { fn, col } = require('sequelize');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { BASELINE_STATUS } = require('../../../config/constants');

async function upsertCheck({ organizationId, deviceId, baselineControlId, status, evidence, note, source }) {
  return sequelize.transaction(async (transaction) => {
    const device = await models.Device.findOne({
      where: { id: deviceId, organization_id: organizationId },
      transaction,
    });
    if (!device) throw AppError.notFound('Device not found');

    const control = await models.BaselineControl.findOne({
      where: { id: baselineControlId, organization_id: organizationId },
      transaction,
    });
    if (!control) throw AppError.notFound('Baseline control not found');

    const [row] = await models.DeviceBaselineCheck.findOrCreate({
      where: { device_id: deviceId, baseline_control_id: baselineControlId },
      defaults: {
        device_id: deviceId,
        baseline_control_id: baselineControlId,
        status: status || BASELINE_STATUS.UNKNOWN,
        checked_at: new Date(),
        evidence: evidence || {},
        remediation_note: note || null,
        source: source || 'agent',
      },
      transaction,
    });

    row.status = status || row.status;
    row.checked_at = new Date();
    if (evidence) row.evidence = evidence;
    if (note !== undefined) row.remediation_note = note;
    if (source) row.source = source;
    await row.save({ transaction });

    return row;
  });
}

async function postureForDevice({ organizationId, deviceId }) {
  const device = await models.Device.findOne({
    where: { id: deviceId, organization_id: organizationId },
  });
  if (!device) throw AppError.notFound('Device not found');

  const checks = await models.DeviceBaselineCheck.findAll({
    where: { device_id: deviceId },
    include: [{ model: models.BaselineControl, as: 'control' }],
  });

  const totals = { pass: 0, fail: 0, warn: 0, skip: 0, unknown: 0 };
  const failing = [];
  for (const c of checks) {
    totals[c.status] = (totals[c.status] || 0) + 1;
    if (c.status === BASELINE_STATUS.FAIL) {
      failing.push({
        control_code: c.control?.code,
        severity: c.control?.severity,
        checked_at: c.checked_at,
        remediation: c.remediation_note,
      });
    }
  }

  const total = checks.length;
  const passRate = total ? Math.round((totals.pass / total) * 1000) / 10 : 0;

  return { device_id: deviceId, total_checks: total, totals, pass_rate: passRate, failing };
}

async function orgPosture({ organizationId }) {
  const rows = await models.DeviceBaselineCheck.findAll({
    attributes: [
      [col('DeviceBaselineCheck.status'), 'status'],
      [fn('COUNT', col('DeviceBaselineCheck.id')), 'count'],
    ],
    include: [
      { model: models.Device, as: 'device', attributes: [], required: true, where: { organization_id: organizationId } },
    ],
    group: [col('DeviceBaselineCheck.status')],
    raw: true,
  });

  const totals = { pass: 0, fail: 0, warn: 0, skip: 0, unknown: 0 };
  for (const r of rows) totals[r.status] = Number(r.count || 0);

  const deviceCount = await models.Device.count({
    where: { organization_id: organizationId },
  });
  const compliantDevices = await models.Device.count({
    where: { organization_id: organizationId },
    include: [
      {
        model: models.DeviceBaselineCheck,
        as: 'baseline_checks',
        required: true,
        where: { status: BASELINE_STATUS.PASS },
      },
    ],
    distinct: true,
  });

  const failingDevices = await models.Device.count({
    where: { organization_id: organizationId },
    include: [
      {
        model: models.DeviceBaselineCheck,
        as: 'baseline_checks',
        required: true,
        where: { status: BASELINE_STATUS.FAIL },
      },
    ],
    distinct: true,
  });

  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  const passRate = total ? Math.round((totals.pass / total) * 1000) / 10 : 0;

  return {
    devices: deviceCount,
    devices_with_pass: compliantDevices,
    devices_with_fail: failingDevices,
    checks: totals,
    pass_rate: passRate,
  };
}

module.exports = { upsertCheck, postureForDevice, orgPosture };
