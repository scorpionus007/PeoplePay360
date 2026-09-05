'use strict';

const crypto = require('crypto');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { VISA_STATUS } = require('../../../config/constants');

function newCaseCode(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function initiate({ organizationId, payload }) {
  const employee = await models.Employee.findOne({
    where: { id: payload.employee_id, organization_id: organizationId },
  });
  if (!employee) throw AppError.notFound('Employee not found');
  return models.VisaSponsorship.create({
    ...payload,
    organization_id: organizationId,
    case_code: payload.case_code || newCaseCode('VS'),
    status: VISA_STATUS.INITIATED,
  });
}

async function transition({ organizationId, id, toStatus, actorUserId, note }) {
  const row = await models.VisaSponsorship.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!row) throw AppError.notFound('Visa case not found');

  const terminal = [VISA_STATUS.APPROVED, VISA_STATUS.DENIED, VISA_STATUS.EXPIRED, VISA_STATUS.RENEWED, VISA_STATUS.CANCELLED];
  if (terminal.includes(row.status) && toStatus !== VISA_STATUS.RENEWED) {
    throw AppError.conflict('Visa case is already in a terminal state');
  }

  row.status = toStatus;
  if (toStatus === VISA_STATUS.FILED) row.filed_at = new Date();
  if ([VISA_STATUS.APPROVED, VISA_STATUS.DENIED].includes(toStatus)) row.decision_at = new Date();
  if (toStatus === VISA_STATUS.APPROVED) {
    row.approved_by = actorUserId;
    row.approved_at = new Date();
    row.approval_note = note || row.approval_note;
  }
  if (toStatus === VISA_STATUS.DENIED) row.denial_reason = note || row.denial_reason;
  await row.save();
  return row;
}

async function renew({ organizationId, id, actorUserId }) {
  const previous = await models.VisaSponsorship.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!previous) throw AppError.notFound('Visa case not found');
  if (previous.status !== VISA_STATUS.APPROVED) {
    throw AppError.conflict('Only approved visas can be renewed');
  }
  const renewed = await models.VisaSponsorship.create({
    organization_id: organizationId,
    employee_id: previous.employee_id,
    mobility_partner_id: previous.mobility_partner_id,
    case_code: newCaseCode('VS'),
    visa_type: previous.visa_type,
    country_code: previous.country_code,
    visa_category: previous.visa_category,
    status: VISA_STATUS.INITIATED,
    renewal_of_case_id: previous.id,
    priority: previous.priority,
    currency: previous.currency,
    metadata: { ...(previous.metadata || {}), renewal_of: previous.case_code },
  });
  previous.status = VISA_STATUS.RENEWED;
  await previous.save();
  return renewed;
}

async function addDocument({ organizationId, visaId, payload, actorUserId }) {
  const visa = await models.VisaSponsorship.findOne({
    where: { id: visaId, organization_id: organizationId },
  });
  if (!visa) throw AppError.notFound('Visa case not found');
  return models.VisaDocument.create({
    ...payload,
    visa_sponsorship_id: visaId,
    uploaded_by: actorUserId || null,
    status: payload.file_url ? 'uploaded' : 'pending',
  });
}

module.exports = { initiate, transition, renew, addDocument };
