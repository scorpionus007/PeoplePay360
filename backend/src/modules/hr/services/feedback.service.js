'use strict';

const crypto = require('crypto');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { FEEDBACK_STATUS } = require('../../../config/constants');

function fingerprintFor({ orgId, ip, userAgent, salt }) {
  const material = `${orgId}|${ip || ''}|${userAgent || ''}|${salt || 'peoplepay360'}`;
  return crypto.createHash('sha256').update(material).digest('hex');
}

async function submit({ organizationId, actorEmployeeId, payload, ip, userAgent }) {
  const anonymous = !!payload.anonymous;
  const fingerprint = anonymous
    ? fingerprintFor({ orgId: organizationId, ip, userAgent, salt: process.env.FEEDBACK_SALT })
    : null;

  const entry = await models.FeedbackEntry.create({
    organization_id: organizationId,
    employee_id: anonymous ? null : actorEmployeeId,
    is_anonymous: anonymous,
    category: payload.category,
    subject: payload.subject,
    body: payload.body,
    priority: payload.priority || 'normal',
    status: FEEDBACK_STATUS.NEW,
    anonymous_fingerprint: fingerprint,
  });
  return entry;
}

async function updateStatus({ organizationId, id, status, note, actorUserId }) {
  const entry = await models.FeedbackEntry.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!entry) throw AppError.notFound('Feedback entry not found');
  entry.status = status;
  if (status === FEEDBACK_STATUS.CLOSED) entry.resolved_at = new Date();
  if (status === FEEDBACK_STATUS.ESCALATED) entry.escalated_at = new Date();
  if (note) entry.resolution_note = note;
  entry.handled_by = actorUserId || entry.handled_by;
  await entry.save();
  return entry;
}

module.exports = { submit, updateStatus };
