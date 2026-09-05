'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const interview = require('../services/interview.service');

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.application_id) where.application_id = req.query.application_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.from) where.scheduled_start = { [Op.gte]: new Date(req.query.from) };
  if (req.query.to) where.scheduled_start = { ...(where.scheduled_start || {}), [Op.lte]: new Date(req.query.to) };
  const rows = await models.Interview.findAll({
    where,
    order: [['scheduled_start', 'ASC']],
    include: [
      {
        model: models.Application,
        as: 'application',
        include: [
          { model: models.Candidate, as: 'candidate', attributes: ['id', 'first_name', 'last_name', 'email'] },
        ],
      },
    ],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.Interview.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Application, as: 'application' },
      { model: models.InterviewFeedback, as: 'feedback' },
    ],
  });
  if (!row) throw AppError.notFound('Interview not found');
  return success(res, row);
}

async function schedule(req, res) {
  const row = await interview.schedule({
    organizationId: req.user.organizationId,
    applicationId: req.body.application_id,
    payload: req.body,
    actorUserId: req.user.id,
  });
  return created(res, row);
}

async function reschedule(req, res) {
  const row = await models.Interview.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Interview not found');
  const previousStart = row.scheduled_start;
  const previousEnd = row.scheduled_end;
  await row.update({
    scheduled_start: req.body.scheduled_start || previousStart,
    scheduled_end: req.body.scheduled_end || previousEnd,
    status: 'rescheduled',
    note: req.body.note || row.note,
  });
  return success(res, row);
}

async function cancel(req, res) {
  const row = await interview.cancelInterview({
    organizationId: req.user.organizationId,
    interviewId: req.params.id,
    reason: req.body.reason,
  });
  return success(res, row);
}

async function submitFeedback(req, res) {
  const row = await interview.submitFeedback({
    organizationId: req.user.organizationId,
    interviewId: req.params.id,
    panelistUserId: req.user.id,
    panelistRole: req.body.panelist_role,
    overallRating: req.body.overall_rating,
    recommendation: req.body.recommendation,
    strengths: req.body.strengths,
    concerns: req.body.concerns,
    questionsAsked: req.body.questions_asked,
    notes: req.body.notes,
    criteriaScores: req.body.criteria_scores,
  });
  return created(res, row);
}

module.exports = { list, getOne, schedule, reschedule, cancel, submitFeedback };
