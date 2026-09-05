'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const offerService = require('../services/offer.service');

async function list(req, res) {
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.application_id) where.application_id = req.query.application_id;
  if (req.query.candidate_id) where.candidate_id = req.query.candidate_id;
  const rows = await models.Offer.findAll({
    where,
    order: [['created_at', 'DESC']],
    include: [
      { model: models.Candidate, as: 'candidate', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: models.Requisition, as: 'requisition', attributes: ['id', 'code', 'title'] },
    ],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.Offer.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Candidate, as: 'candidate' },
      { model: models.Application, as: 'application' },
      { model: models.Requisition, as: 'requisition' },
    ],
  });
  if (!row) throw AppError.notFound('Offer not found');
  return success(res, row);
}

async function draft(req, res) {
  const row = await offerService.draft({
    organizationId: req.user.organizationId,
    applicationId: req.body.application_id,
    payload: req.body,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.Offer.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Offer not found');
  if (row.status !== 'draft') throw AppError.conflict('Only draft offers can be edited');
  await row.update(req.body);
  return success(res, row);
}

async function submitForApproval(req, res) {
  const row = await offerService.submitForApproval({
    organizationId: req.user.organizationId,
    id: req.params.id,
  });
  return success(res, row);
}

async function approve(req, res) {
  const row = await offerService.approve({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approverUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function extend(req, res) {
  const row = await offerService.extend({
    organizationId: req.user.organizationId,
    id: req.params.id,
    actorUserId: req.user.id,
  });
  return success(res, row);
}

async function accept(req, res) {
  const row = await offerService.accept({
    organizationId: req.user.organizationId,
    id: req.params.id,
    note: req.body.note,
    actorUserId: req.user.id,
  });
  return success(res, row);
}

async function decline(req, res) {
  const row = await offerService.decline({
    organizationId: req.user.organizationId,
    id: req.params.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function rescind(req, res) {
  const row = await offerService.rescind({
    organizationId: req.user.organizationId,
    id: req.params.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.Offer.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Offer not found');
  if (row.status !== 'draft') throw AppError.conflict('Only draft offers can be deleted');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, draft, update, submitForApproval, approve, extend, accept, decline, rescind, remove };
