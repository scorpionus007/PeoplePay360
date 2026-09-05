'use strict';

const { Op, fn, col } = require('sequelize');
const { models } = require('../../../models');
const { success } = require('../../../utils/response');
const money = require('../../../utils/money');
const {
  VISA_STATUS,
  RELOCATION_STATUS,
  IMMIGRATION_CASE_STATUS,
  TRAVEL_STATUS,
} = require('../../../config/constants');

async function overview(req, res) {
  const orgId = req.user.organizationId;
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const [
    activeVisas,
    visasByStatus,
    visasExpiringSoon,
    activeRelocations,
    completedRelocations,
    openImmigration,
    upcomingTravel,
    partnersCount,
    locationStandardsCount,
    relocationSpend,
  ] = await Promise.all([
    models.VisaSponsorship.count({
      where: {
        organization_id: orgId,
        status: { [Op.notIn]: [VISA_STATUS.CANCELLED, VISA_STATUS.DENIED, VISA_STATUS.EXPIRED, VISA_STATUS.RENEWED] },
      },
    }),
    models.VisaSponsorship.findAll({
      where: { organization_id: orgId },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    models.VisaSponsorship.count({
      where: {
        organization_id: orgId,
        status: VISA_STATUS.APPROVED,
        valid_to: { [Op.between]: [today, thirtyDaysFromNow] },
      },
    }),
    models.RelocationCase.count({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [RELOCATION_STATUS.REQUESTED, RELOCATION_STATUS.APPROVED, RELOCATION_STATUS.IN_PROGRESS] },
      },
    }),
    models.RelocationCase.count({
      where: { organization_id: orgId, status: RELOCATION_STATUS.COMPLETED },
    }),
    models.ImmigrationCase.count({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [IMMIGRATION_CASE_STATUS.OPEN, IMMIGRATION_CASE_STATUS.IN_PROGRESS, IMMIGRATION_CASE_STATUS.ESCALATED] },
      },
    }),
    models.TravelRequest.count({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [TRAVEL_STATUS.APPROVED, TRAVEL_STATUS.BOOKED, TRAVEL_STATUS.IN_PROGRESS] },
        depart_date: { [Op.gte]: today },
      },
    }),
    models.MobilityPartner.count({ where: { organization_id: orgId, is_active: true } }),
    models.LocationStandard.count({ where: { organization_id: orgId, is_active: true } }),
    models.RelocationCase.findOne({
      where: { organization_id: orgId },
      attributes: [
        [fn('COALESCE', fn('SUM', col('spent_amount')), 0), 'total_spent'],
        [fn('COALESCE', fn('SUM', col('budget_amount')), 0), 'total_budget'],
      ],
      raw: true,
    }),
  ]);

  return success(res, {
    kpis: {
      active_visa_cases: activeVisas,
      visas_expiring_in_30_days: visasExpiringSoon,
      active_relocations: activeRelocations,
      completed_relocations: completedRelocations,
      open_immigration_cases: openImmigration,
      upcoming_travel: upcomingTravel,
      active_mobility_partners: partnersCount,
      configured_location_standards: locationStandardsCount,
      total_relocation_spent: money.round(Number(relocationSpend?.total_spent || 0)),
      total_relocation_budget: money.round(Number(relocationSpend?.total_budget || 0)),
    },
    visas_by_status: visasByStatus.map((r) => ({ status: r.status, count: Number(r.count || 0) })),
  });
}

module.exports = { overview };
