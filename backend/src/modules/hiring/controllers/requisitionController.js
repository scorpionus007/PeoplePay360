'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const { REQUISITION_STATUS } = require('../../../config/constants');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.department_id) where.department_id = req.query.department_id;
  if (req.query.hiring_track) where.hiring_track = req.query.hiring_track;
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { code: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }
  const { rows, count } = await models.Requisition.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Department, as: 'department', attributes: ['id', 'name', 'code'] },
      { model: models.Employee, as: 'hiring_manager', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Department, as: 'department' },
      { model: models.Employee, as: 'hiring_manager' },
      { model: models.JobPosting, as: 'postings' },
    ],
  });
  if (!row) throw AppError.notFound('Requisition not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.Requisition.create({
    ...req.body,
    organization_id: req.user.organizationId,
    requested_by: req.user.id,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Requisition not found');
  await row.update(req.body);
  return success(res, row);
}

async function submitForApproval(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Requisition not found');
  if (row.status !== REQUISITION_STATUS.DRAFT) {
    throw AppError.conflict('Only draft requisitions can be submitted for approval');
  }
  row.status = REQUISITION_STATUS.PENDING_APPROVAL;
  await row.save();
  return success(res, row);
}

async function approve(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Requisition not found');
  if (![REQUISITION_STATUS.PENDING_APPROVAL, REQUISITION_STATUS.DRAFT].includes(row.status)) {
    throw AppError.conflict('Requisition is not in an approvable state');
  }
  row.status = REQUISITION_STATUS.APPROVED;
  row.approved_by = req.user.id;
  row.approved_at = new Date();
  row.approval_note = req.body.note || null;
  await row.save();
  return success(res, row);
}

async function hold(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Requisition not found');
  row.status = REQUISITION_STATUS.ON_HOLD;
  await row.save();
  return success(res, row);
}

async function cancel(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Requisition not found');
  row.status = REQUISITION_STATUS.CANCELLED;
  await row.save();
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.Requisition.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Requisition not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, submitForApproval, approve, hold, cancel, remove };
