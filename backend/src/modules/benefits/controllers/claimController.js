'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const claim = require('../services/claim.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.plan_id) where.benefit_plan_id = req.query.plan_id;
  const { rows, count } = await models.BenefitClaim.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.BenefitPlan, as: 'plan' },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.BenefitClaim.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.BenefitPlan, as: 'plan' },
      { model: models.BenefitEnrollment, as: 'enrollment' },
    ],
  });
  if (!row) throw AppError.notFound('Claim not found');
  return success(res, row);
}

async function submit(req, res) {
  const employeeId = req.body.employee_id || req.user.employeeId;
  if (!employeeId) throw AppError.badRequest('No employee associated with this user');
  const row = await claim.submit({
    organizationId: req.user.organizationId,
    employeeId,
    enrollmentId: req.body.benefit_enrollment_id,
    subject: req.body.subject,
    description: req.body.description,
    incurredOn: req.body.incurred_on,
    amount: req.body.claim_amount,
    currency: req.body.currency,
    documents: req.body.documents,
  });
  return created(res, row);
}

async function startReview(req, res) {
  const row = await claim.startReview({
    organizationId: req.user.organizationId,
    id: req.params.id,
    reviewerUserId: req.user.id,
  });
  return success(res, row);
}

async function approve(req, res) {
  const row = await claim.approve({
    organizationId: req.user.organizationId,
    id: req.params.id,
    approvedAmount: req.body.approved_amount,
    reviewerUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function reject(req, res) {
  const row = await claim.reject({
    organizationId: req.user.organizationId,
    id: req.params.id,
    reviewerUserId: req.user.id,
    note: req.body.note,
  });
  return success(res, row);
}

async function reimburse(req, res) {
  const row = await claim.reimburse({
    organizationId: req.user.organizationId,
    id: req.params.id,
    reimbursedAmount: req.body.reimbursed_amount,
    reimburserUserId: req.user.id,
    externalReference: req.body.external_reference,
  });
  return success(res, row);
}

async function cancel(req, res) {
  const row = await claim.cancel({
    organizationId: req.user.organizationId,
    id: req.params.id,
  });
  return success(res, row);
}

module.exports = { list, getOne, submit, startReview, approve, reject, reimburse, cancel };
