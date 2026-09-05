'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const applicationService = require('../services/application.service');
const pipeline = require('../services/pipeline.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.requisition_id) where.requisition_id = req.query.requisition_id;
  if (req.query.candidate_id) where.candidate_id = req.query.candidate_id;
  if (req.query.job_posting_id) where.job_posting_id = req.query.job_posting_id;
  if (req.query.current_stage) where.current_stage = req.query.current_stage;
  if (req.query.source) where.source = req.query.source;
  const { rows, count } = await models.Application.findAndCountAll({
    where,
    order: [['applied_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Candidate, as: 'candidate' },
      { model: models.Requisition, as: 'requisition', attributes: ['id', 'code', 'title'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.Application.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Candidate, as: 'candidate' },
      { model: models.Requisition, as: 'requisition' },
      { model: models.JobPosting, as: 'posting' },
      { model: models.ApplicationStageHistory, as: 'stage_history' },
      { model: models.Interview, as: 'interviews' },
      { model: models.Offer, as: 'offers' },
    ],
    order: [
      [{ model: models.ApplicationStageHistory, as: 'stage_history' }, 'changed_at', 'ASC'],
      [{ model: models.Interview, as: 'interviews' }, 'scheduled_start', 'ASC'],
    ],
  });
  if (!row) throw AppError.notFound('Application not found');
  return success(res, row);
}

async function submit(req, res) {
  const row = await applicationService.createApplication({
    organizationId: req.user.organizationId,
    requisitionId: req.body.requisition_id,
    jobPostingId: req.body.job_posting_id,
    candidate: req.body.candidate,
    source: req.body.source,
    referralId: req.body.referral_id,
    coverLetterUrl: req.body.cover_letter_url,
    assignedRecruiterId: req.body.assigned_recruiter_id,
  });
  return created(res, row);
}

async function progress(req, res) {
  const row = await pipeline.moveStage({
    organizationId: req.user.organizationId,
    applicationId: req.params.id,
    toStage: req.body.to_stage,
    actorUserId: req.user.id,
    note: req.body.note,
    rejectionReason: req.body.rejection_reason,
  });
  return success(res, row);
}

async function reject(req, res) {
  const row = await pipeline.reject({
    organizationId: req.user.organizationId,
    applicationId: req.params.id,
    actorUserId: req.user.id,
    reason: req.body.reason,
  });
  return success(res, row);
}

async function withdraw(req, res) {
  const row = await pipeline.withdraw({
    organizationId: req.user.organizationId,
    applicationId: req.params.id,
    actorUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

module.exports = { list, getOne, submit, progress, reject, withdraw };
