'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { REFERRAL_STATUS } = require('../../../config/constants');

async function submit({ organizationId, referrerEmployeeId, payload }) {
  return sequelize.transaction(async (transaction) => {
    if (!referrerEmployeeId) throw AppError.badRequest('Referrer employee is required');
    if (payload.requisition_id) {
      const req = await models.Requisition.findOne({
        where: { id: payload.requisition_id, organization_id: organizationId },
        transaction,
      });
      if (!req) throw AppError.notFound('Requisition not found');
    }

    const email = String(payload.candidate_email || '').toLowerCase();
    let candidate = await models.Candidate.findOne({
      where: { organization_id: organizationId, email },
      transaction,
    });
    if (!candidate) {
      candidate = await models.Candidate.create(
        {
          organization_id: organizationId,
          first_name: payload.candidate_first_name,
          last_name: payload.candidate_last_name,
          email,
          phone: payload.candidate_phone || null,
          resume_url: payload.candidate_resume_url || null,
        },
        { transaction }
      );
    }

    return models.Referral.create(
      {
        organization_id: organizationId,
        referrer_employee_id: referrerEmployeeId,
        requisition_id: payload.requisition_id || null,
        candidate_id: candidate.id,
        candidate_first_name: payload.candidate_first_name,
        candidate_last_name: payload.candidate_last_name,
        candidate_email: email,
        candidate_phone: payload.candidate_phone || null,
        candidate_resume_url: payload.candidate_resume_url || null,
        relationship: payload.relationship || null,
        recommendation: payload.recommendation || null,
        status: REFERRAL_STATUS.SUBMITTED,
      },
      { transaction }
    );
  });
}

async function review({ organizationId, id, reviewerUserId, status, note }) {
  const referral = await models.Referral.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!referral) throw AppError.notFound('Referral not found');
  if (
    [REFERRAL_STATUS.HIRED, REFERRAL_STATUS.BONUS_PAID, REFERRAL_STATUS.CANCELLED].includes(referral.status)
  ) {
    throw AppError.conflict('Referral is in a terminal state');
  }
  referral.status = status;
  referral.reviewer_id = reviewerUserId;
  referral.reviewed_at = new Date();
  referral.review_note = note || referral.review_note;
  await referral.save();
  return referral;
}

async function markBonusPaid({ organizationId, id, amount, currency }) {
  const referral = await models.Referral.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!referral) throw AppError.notFound('Referral not found');
  if (referral.status !== REFERRAL_STATUS.HIRED) {
    throw AppError.conflict('Bonus can only be paid on a referral marked hired');
  }
  referral.bonus_amount = amount;
  referral.bonus_currency = currency || 'USD';
  referral.bonus_paid_at = new Date();
  referral.status = REFERRAL_STATUS.BONUS_PAID;
  await referral.save();
  return referral;
}

module.exports = { submit, review, markBonusPaid };
