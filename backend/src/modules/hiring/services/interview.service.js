'use strict';

const { Op } = require('sequelize');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  INTERVIEW_STATUS,
  APPLICATION_STAGE,
} = require('../../../config/constants');
const pipeline = require('./pipeline.service');

async function schedule({ organizationId, applicationId, payload, actorUserId }) {
  return sequelize.transaction(async (transaction) => {
    const application = await models.Application.findOne({
      where: { id: applicationId, organization_id: organizationId },
      transaction,
    });
    if (!application) throw AppError.notFound('Application not found');

    const roundIndex = payload.round_index
      ? payload.round_index
      : (await models.Interview.count({
          where: { application_id: applicationId },
          transaction,
        })) + 1;

    if (new Date(payload.scheduled_end) <= new Date(payload.scheduled_start)) {
      throw AppError.badRequest('Interview end must be after start');
    }

    const interview = await models.Interview.create(
      {
        ...payload,
        organization_id: organizationId,
        application_id: applicationId,
        round_index: roundIndex,
        panelists: Array.isArray(payload.panelists) ? payload.panelists : [],
        scheduled_by: actorUserId || null,
        status: INTERVIEW_STATUS.SCHEDULED,
      },
      { transaction }
    );

    if (application.current_stage === APPLICATION_STAGE.APPLIED || application.current_stage === APPLICATION_STAGE.SCREENING) {
      application.current_stage = APPLICATION_STAGE.INTERVIEW;
      await application.save({ transaction });
      await models.ApplicationStageHistory.create(
        {
          application_id: application.id,
          from_stage: APPLICATION_STAGE.APPLIED,
          to_stage: APPLICATION_STAGE.INTERVIEW,
          note: `Interview round ${roundIndex} scheduled`,
          changed_by: actorUserId || null,
        },
        { transaction }
      );
    }

    return interview;
  });
}

async function submitFeedback({ organizationId, interviewId, panelistUserId, panelistRole, overallRating, recommendation, strengths, concerns, questionsAsked, notes, criteriaScores }) {
  return sequelize.transaction(async (transaction) => {
    const interview = await models.Interview.findOne({ where: { id: interviewId, organization_id: organizationId }, transaction });
    if (!interview) throw AppError.notFound('Interview not found');
    if ([INTERVIEW_STATUS.CANCELLED, INTERVIEW_STATUS.NO_SHOW].includes(interview.status)) {
      throw AppError.conflict('Cannot submit feedback for cancelled or no-show interview');
    }

    const [row] = await models.InterviewFeedback.findOrCreate({
      where: { interview_id: interviewId, panelist_user_id: panelistUserId },
      defaults: {
        interview_id: interviewId,
        panelist_user_id: panelistUserId,
        panelist_role: panelistRole || null,
        overall_rating: overallRating ?? null,
        recommendation,
        strengths: strengths || null,
        concerns: concerns || null,
        questions_asked: questionsAsked || null,
        notes: notes || null,
        criteria_scores: criteriaScores || {},
      },
      transaction,
    });

    row.panelist_role = panelistRole || row.panelist_role;
    if (overallRating !== undefined) row.overall_rating = overallRating;
    row.recommendation = recommendation;
    if (strengths !== undefined) row.strengths = strengths;
    if (concerns !== undefined) row.concerns = concerns;
    if (questionsAsked !== undefined) row.questions_asked = questionsAsked;
    if (notes !== undefined) row.notes = notes;
    if (criteriaScores !== undefined) row.criteria_scores = criteriaScores;
    row.submitted_at = new Date();
    await row.save({ transaction });

    if (interview.status === INTERVIEW_STATUS.SCHEDULED) {
      interview.status = INTERVIEW_STATUS.COMPLETED;
      await interview.save({ transaction });
    }

    return row;
  });
}

async function cancelInterview({ organizationId, interviewId, reason }) {
  const interview = await models.Interview.findOne({
    where: { id: interviewId, organization_id: organizationId },
  });
  if (!interview) throw AppError.notFound('Interview not found');
  if (interview.status !== INTERVIEW_STATUS.SCHEDULED) {
    throw AppError.conflict('Only scheduled interviews can be cancelled');
  }
  interview.status = INTERVIEW_STATUS.CANCELLED;
  interview.cancellation_reason = reason || null;
  await interview.save();
  return interview;
}

async function upcomingForApplication({ organizationId, applicationId }) {
  return models.Interview.findAll({
    where: {
      organization_id: organizationId,
      application_id: applicationId,
      status: INTERVIEW_STATUS.SCHEDULED,
      scheduled_start: { [Op.gte]: new Date() },
    },
    order: [['scheduled_start', 'ASC']],
  });
}

module.exports = { schedule, submitFeedback, cancelInterview, upcomingForApplication };
