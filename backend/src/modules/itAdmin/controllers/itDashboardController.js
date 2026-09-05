'use strict';

const { fn, col, Op } = require('sequelize');
const { models } = require('../../../models');
const { success } = require('../../../utils/response');
const baseline = require('../services/baseline.service');
const { DEVICE_STATUS, EDR_EVENT_SEVERITY } = require('../../../config/constants');

async function overview(req, res) {
  const orgId = req.user.organizationId;

  const [
    totalDevices,
    devicesByStatus,
    devicesByOwnership,
    devicesByCategory,
    softwareCount,
    activeIntegrations,
    highSeverityEvents,
    pendingProvisions,
    posture,
  ] = await Promise.all([
    models.Device.count({ where: { organization_id: orgId } }),
    models.Device.findAll({
      where: { organization_id: orgId },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    models.Device.findAll({
      where: { organization_id: orgId },
      attributes: ['ownership', [fn('COUNT', col('id')), 'count']],
      group: ['ownership'],
      raw: true,
    }),
    models.Device.findAll({
      where: { organization_id: orgId },
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    }),
    models.SoftwareCatalogItem.count({ where: { organization_id: orgId } }),
    models.EdrIntegration.count({ where: { organization_id: orgId, status: 'connected' } }),
    models.EdrEvent.count({
      where: {
        organization_id: orgId,
        severity: { [Op.in]: [EDR_EVENT_SEVERITY.HIGH, EDR_EVENT_SEVERITY.CRITICAL] },
        status: { [Op.notIn]: ['resolved', 'false_positive'] },
      },
    }),
    models.OnboardingProvision.count({
      where: { organization_id: orgId, status: { [Op.notIn]: ['activated', 'cancelled'] } },
    }),
    baseline.orgPosture({ organizationId: orgId }),
  ]);

  const statusMap = Object.values(DEVICE_STATUS).reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  for (const r of devicesByStatus) statusMap[r.status] = Number(r.count || 0);

  return success(res, {
    kpis: {
      total_devices: totalDevices,
      software_items: softwareCount,
      active_edr_integrations: activeIntegrations,
      open_high_severity_events: highSeverityEvents,
      pending_onboarding_provisions: pendingProvisions,
      baseline_pass_rate: posture.pass_rate,
    },
    devices_by_status: statusMap,
    devices_by_ownership: devicesByOwnership.map((r) => ({ ownership: r.ownership, count: Number(r.count || 0) })),
    devices_by_category: devicesByCategory.map((r) => ({ category: r.category, count: Number(r.count || 0) })),
    baseline_posture: posture,
  });
}

module.exports = { overview };
