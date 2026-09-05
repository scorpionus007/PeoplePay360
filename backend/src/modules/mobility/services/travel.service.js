'use strict';

const crypto = require('crypto');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { TRAVEL_STATUS } = require('../../../config/constants');

function newCode() {
  return `TR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function submit({ organizationId, employeeId, payload }) {
  if (new Date(payload.return_date) < new Date(payload.depart_date)) {
    throw AppError.badRequest('Return date must not be before depart date');
  }
  return models.TravelRequest.create({
    ...payload,
    organization_id: organizationId,
    employee_id: employeeId,
    code: payload.code || newCode(),
    status: TRAVEL_STATUS.SUBMITTED,
  });
}

async function transition({ organizationId, id, toStatus, approverUserId, note, bookingReference }) {
  const row = await models.TravelRequest.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!row) throw AppError.notFound('Travel request not found');
  if ([TRAVEL_STATUS.COMPLETED, TRAVEL_STATUS.CANCELLED].includes(row.status)) {
    throw AppError.conflict('Travel request is already terminal');
  }
  row.status = toStatus;
  if (toStatus === TRAVEL_STATUS.APPROVED || toStatus === TRAVEL_STATUS.REJECTED) {
    row.approver_id = approverUserId;
    row.approved_at = new Date();
    row.approval_note = note || row.approval_note;
  }
  if (toStatus === TRAVEL_STATUS.BOOKED) {
    row.booking_reference = bookingReference || row.booking_reference;
  }
  await row.save();
  return row;
}

module.exports = { submit, transition };
