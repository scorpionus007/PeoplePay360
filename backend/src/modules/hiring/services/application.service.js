'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  APPLICATION_STAGE,
  APPLICATION_SOURCE,
  REQUISITION_STATUS,
} = require('../../../config/constants');

async function ensureCandidate({ organizationId, candidateData, transaction }) {
  if (candidateData.id) {
    const existing = await models.Candidate.findOne({
      where: { id: candidateData.id, organization_id: organizationId },
      transaction,
    });
    if (!existing) throw AppError.notFound('Candidate not found');
    return existing;
  }
  const normalizedEmail = String(candidateData.email || '').toLowerCase();
  const byEmail = await models.Candidate.findOne({
    where: { organization_id: organizationId, email: normalizedEmail },
    transaction,
  });
  if (byEmail) return byEmail;
  return models.Candidate.create(
    {
      ...candidateData,
      email: normalizedEmail,
      organization_id: organizationId,
    },
    { transaction }
  );
}

async function createApplication({ organizationId, requisitionId, jobPostingId, candidate, source, referralId, coverLetterUrl, assignedRecruiterId }) {
  return sequelize.transaction(async (transaction) => {
    const requisition = await models.Requisition.findOne({
      where: { id: requisitionId, organization_id: organizationId },
      transaction,
    });
    if (!requisition) throw AppError.notFound('Requisition not found');
    if (![REQUISITION_STATUS.APPROVED].includes(requisition.status)) {
      throw AppError.conflict('Requisition must be approved to accept applications');
    }
    if (requisition.headcount_filled >= requisition.headcount) {
      throw AppError.conflict('Requisition has no remaining headcount');
    }

    if (jobPostingId) {
      const posting = await models.JobPosting.findOne({
        where: { id: jobPostingId, requisition_id: requisitionId, organization_id: organizationId },
        transaction,
      });
      if (!posting) throw AppError.notFound('Job posting not found for this requisition');
    }

    const candidateRow = await ensureCandidate({
      organizationId,
      candidateData: candidate,
      transaction,
    });
    if (candidateRow.is_blacklisted) throw AppError.forbidden('Candidate is blacklisted');

    const existingApp = await models.Application.findOne({
      where: { candidate_id: candidateRow.id, requisition_id: requisitionId },
      transaction,
    });
    if (existingApp) throw AppError.conflict('Candidate has already applied to this requisition');

    const application = await models.Application.create(
      {
        organization_id: organizationId,
        candidate_id: candidateRow.id,
        requisition_id: requisitionId,
        job_posting_id: jobPostingId || null,
        referral_id: referralId || null,
        source: source || APPLICATION_SOURCE.DIRECT,
        current_stage: APPLICATION_STAGE.APPLIED,
        cover_letter_url: coverLetterUrl || null,
        assigned_recruiter_id: assignedRecruiterId || null,
      },
      { transaction }
    );

    await models.ApplicationStageHistory.create(
      {
        application_id: application.id,
        from_stage: null,
        to_stage: APPLICATION_STAGE.APPLIED,
        note: 'Application submitted',
      },
      { transaction }
    );

    if (jobPostingId) {
      await models.JobPosting.increment('applications_count', {
        where: { id: jobPostingId },
        by: 1,
        transaction,
      });
    }

    return application;
  });
}

module.exports = { createApplication, ensureCandidate };
