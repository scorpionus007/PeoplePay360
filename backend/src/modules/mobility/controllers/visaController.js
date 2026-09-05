'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const visa = require('../services/visa.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.country_code) where.country_code = req.query.country_code;
  if (req.query.visa_type) where.visa_type = req.query.visa_type;
  const { rows, count } = await models.VisaSponsorship.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.MobilityPartner, as: 'partner', attributes: ['id', 'name', 'category'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.VisaSponsorship.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.MobilityPartner, as: 'partner' },
      { model: models.VisaDocument, as: 'documents' },
    ],
  });
  if (!row) throw AppError.notFound('Visa case not found');
  return success(res, row);
}

async function initiate(req, res) {
  const row = await visa.initiate({
    organizationId: req.user.organizationId,
    payload: req.body,
  });
  return created(res, row);
}

async function transition(req, res) {
  const row = await visa.transition({
    organizationId: req.user.organizationId,
    id: req.params.id,
    toStatus: req.body.status,
    actorUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function renew(req, res) {
  const row = await visa.renew({
    organizationId: req.user.organizationId,
    id: req.params.id,
    actorUserId: req.user.id,
  });
  return created(res, row);
}

async function addDocument(req, res) {
  const row = await visa.addDocument({
    organizationId: req.user.organizationId,
    visaId: req.params.id,
    payload: req.body,
    actorUserId: req.user.id,
  });
  return created(res, row);
}

async function remove(req, res) {
  const row = await models.VisaSponsorship.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Visa case not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, initiate, transition, renew, addDocument, remove };
