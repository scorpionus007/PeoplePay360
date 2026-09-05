'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const money = require('../../../utils/money');
const { BENEFIT_CLAIM_STATUS, BENEFIT_ENROLLMENT_STATUS } = require('../../../config/constants');

function nextClaimCode() {
  return `CLM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')}`;
}

async function submit({ organizationId, employeeId, enrollmentId, subject, description, incurredOn, amount, currency, documents }) {
  return sequelize.transaction(async (transaction) => {
    const enrollment = await models.BenefitEnrollment.findOne({
      where: { id: enrollmentId, organization_id: organizationId, employee_id: employeeId },
      include: [{ model: models.BenefitPlan, as: 'plan' }],
      transaction,
    });
    if (!enrollment) throw AppError.notFound('Enrollment not found for this employee');
    if (enrollment.status !== BENEFIT_ENROLLMENT_STATUS.ACTIVE) {
      throw AppError.conflict('Enrollment is not active');
    }
    const numericAmount = money.toNumber(amount);
    if (numericAmount <= 0) throw AppError.badRequest('Claim amount must be greater than zero');
    const coverage = enrollment.plan ? money.toNumber(enrollment.plan.coverage_amount) : 0;
    if (coverage > 0 && numericAmount > coverage) {
      throw AppError.unprocessable(`Claim amount exceeds the plan coverage of ${coverage}`, { coverage });
    }

    return models.BenefitClaim.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        benefit_enrollment_id: enrollmentId,
        benefit_plan_id: enrollment.benefit_plan_id,
        claim_code: nextClaimCode(),
        subject,
        description: description || null,
        incurred_on: incurredOn,
        claim_amount: numericAmount,
        currency: currency || enrollment.currency,
        status: BENEFIT_CLAIM_STATUS.SUBMITTED,
        documents: Array.isArray(documents) ? documents : [],
      },
      { transaction }
    );
  });
}

async function startReview({ organizationId, id, reviewerUserId }) {
  const claim = await models.BenefitClaim.findOne({ where: { id, organization_id: organizationId } });
  if (!claim) throw AppError.notFound('Claim not found');
  if (claim.status !== BENEFIT_CLAIM_STATUS.SUBMITTED) {
    throw AppError.conflict('Only submitted claims can enter review');
  }
  claim.status = BENEFIT_CLAIM_STATUS.UNDER_REVIEW;
  claim.reviewed_by = reviewerUserId;
  claim.reviewed_at = new Date();
  await claim.save();
  return claim;
}

async function approve({ organizationId, id, approvedAmount, reviewerUserId, note }) {
  const claim = await models.BenefitClaim.findOne({ where: { id, organization_id: organizationId } });
  if (!claim) throw AppError.notFound('Claim not found');
  if (![BENEFIT_CLAIM_STATUS.SUBMITTED, BENEFIT_CLAIM_STATUS.UNDER_REVIEW].includes(claim.status)) {
    throw AppError.conflict('Claim is not in an approvable state');
  }
  const claimAmount = money.toNumber(claim.claim_amount);
  const amount = approvedAmount ?? claimAmount;
  if (amount <= 0) throw AppError.badRequest('Approved amount must be greater than zero');
  if (amount > claimAmount) {
    throw AppError.unprocessable('Approved amount cannot exceed the claimed amount', { claim_amount: claimAmount });
  }
  const plan = await models.BenefitPlan.findByPk(claim.benefit_plan_id);
  const coverage = plan ? money.toNumber(plan.coverage_amount) : 0;
  if (coverage > 0 && amount > coverage) {
    throw AppError.unprocessable(`Approved amount exceeds the plan coverage of ${coverage}`, { coverage });
  }
  claim.status = BENEFIT_CLAIM_STATUS.APPROVED;
  claim.approved_amount = amount;
  claim.reviewed_by = reviewerUserId;
  claim.reviewed_at = new Date();
  claim.review_note = note || claim.review_note;
  await claim.save();
  return claim;
}

async function reject({ organizationId, id, reviewerUserId, note }) {
  const claim = await models.BenefitClaim.findOne({ where: { id, organization_id: organizationId } });
  if (!claim) throw AppError.notFound('Claim not found');
  if (![BENEFIT_CLAIM_STATUS.SUBMITTED, BENEFIT_CLAIM_STATUS.UNDER_REVIEW].includes(claim.status)) {
    throw AppError.conflict('Claim is not in a rejectable state');
  }
  claim.status = BENEFIT_CLAIM_STATUS.REJECTED;
  claim.reviewed_by = reviewerUserId;
  claim.reviewed_at = new Date();
  claim.review_note = note || claim.review_note;
  await claim.save();
  return claim;
}

async function reimburse({ organizationId, id, reimbursedAmount, reimburserUserId, externalReference }) {
  const claim = await models.BenefitClaim.findOne({ where: { id, organization_id: organizationId } });
  if (!claim) throw AppError.notFound('Claim not found');
  if (claim.status !== BENEFIT_CLAIM_STATUS.APPROVED) {
    throw AppError.conflict('Only approved claims can be reimbursed');
  }
  const approved = money.toNumber(claim.approved_amount);
  const amount = reimbursedAmount ?? approved;
  if (amount <= 0) throw AppError.badRequest('Reimbursed amount must be greater than zero');
  if (amount > approved) {
    throw AppError.unprocessable('Reimbursed amount cannot exceed the approved amount', { approved_amount: approved });
  }
  claim.status = BENEFIT_CLAIM_STATUS.REIMBURSED;
  claim.reimbursed_amount = amount;
  claim.reimbursed_by = reimburserUserId;
  claim.reimbursed_at = new Date();
  claim.external_reference = externalReference || claim.external_reference;
  await claim.save();
  return claim;
}

async function cancel({ organizationId, id }) {
  const claim = await models.BenefitClaim.findOne({ where: { id, organization_id: organizationId } });
  if (!claim) throw AppError.notFound('Claim not found');
  if ([BENEFIT_CLAIM_STATUS.REIMBURSED, BENEFIT_CLAIM_STATUS.REJECTED].includes(claim.status)) {
    throw AppError.conflict('Claim cannot be cancelled in current state');
  }
  claim.status = BENEFIT_CLAIM_STATUS.CANCELLED;
  await claim.save();
  return claim;
}

module.exports = { submit, startReview, approve, reject, reimburse, cancel };
