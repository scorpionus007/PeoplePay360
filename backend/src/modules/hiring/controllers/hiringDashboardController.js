'use strict';

const { Op, fn, col } = require('sequelize');
const { models } = require('../../../models');
const { success } = require('../../../utils/response');
const {
  REQUISITION_STATUS,
  JOB_POSTING_STATUS,
  APPLICATION_STAGE,
  OFFER_STATUS,
  INTERVIEW_STATUS,
  REFERRAL_STATUS,
} = require('../../../config/constants');

async function overview(req, res) {
  const orgId = req.user.organizationId;

  const [
    openReqs,
    approvedReqs,
    publishedPostings,
    activeApplications,
    hiresThisPeriod,
    interviewsUpcoming,
    offersExtended,
    offersAccepted,
    activeReferrals,
    stageBreakdown,
    reqsByTrack,
  ] = await Promise.all([
    models.Requisition.count({
      where: { organization_id: orgId, status: { [Op.in]: [REQUISITION_STATUS.APPROVED, REQUISITION_STATUS.PENDING_APPROVAL, REQUISITION_STATUS.ON_HOLD] } },
    }),
    models.Requisition.count({ where: { organization_id: orgId, status: REQUISITION_STATUS.APPROVED } }),
    models.JobPosting.count({ where: { organization_id: orgId, status: JOB_POSTING_STATUS.PUBLISHED } }),
    models.Application.count({
      where: {
        organization_id: orgId,
        current_stage: { [Op.notIn]: [APPLICATION_STAGE.HIRED, APPLICATION_STAGE.REJECTED, APPLICATION_STAGE.WITHDRAWN] },
      },
    }),
    models.Application.count({
      where: { organization_id: orgId, current_stage: APPLICATION_STAGE.HIRED },
    }),
    models.Interview.count({
      where: {
        organization_id: orgId,
        status: INTERVIEW_STATUS.SCHEDULED,
        scheduled_start: { [Op.gte]: new Date() },
      },
    }),
    models.Offer.count({
      where: { organization_id: orgId, status: OFFER_STATUS.EXTENDED },
    }),
    models.Offer.count({
      where: { organization_id: orgId, status: OFFER_STATUS.ACCEPTED },
    }),
    models.Referral.count({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [REFERRAL_STATUS.SUBMITTED, REFERRAL_STATUS.IN_REVIEW, REFERRAL_STATUS.ADVANCED] },
      },
    }),
    models.Application.findAll({
      where: { organization_id: orgId },
      attributes: ['current_stage', [fn('COUNT', col('id')), 'count']],
      group: ['current_stage'],
      raw: true,
    }),
    models.Requisition.findAll({
      where: { organization_id: orgId },
      attributes: ['hiring_track', [fn('COUNT', col('id')), 'count']],
      group: ['hiring_track'],
      raw: true,
    }),
  ]);

  return success(res, {
    kpis: {
      open_requisitions: openReqs,
      approved_requisitions: approvedReqs,
      published_postings: publishedPostings,
      active_applications: activeApplications,
      hires: hiresThisPeriod,
      upcoming_interviews: interviewsUpcoming,
      offers_extended: offersExtended,
      offers_accepted: offersAccepted,
      active_referrals: activeReferrals,
    },
    applications_by_stage: stageBreakdown.map((r) => ({
      stage: r.current_stage,
      count: Number(r.count || 0),
    })),
    requisitions_by_track: reqsByTrack.map((r) => ({
      track: r.hiring_track,
      count: Number(r.count || 0),
    })),
  });
}

module.exports = { overview };
