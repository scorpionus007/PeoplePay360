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
  // The traveler must belong to the caller's organization.
  const employee = await models.Employee.findOne({ where: { id: employeeId, organization_id: organizationId } });
  if (!employee) throw AppError.unprocessable('Traveler does not belong to your organization');
  return models.TravelRequest.create({
    ...payload,
    organization_id: organizationId,
    employee_id: employeeId,
    code: payload.code || newCode(),
    status: TRAVEL_STATUS.SUBMITTED,
  });
}

// Each target status may only be reached from a valid prior state.
const TRAVEL_TRANSITIONS = {
  [TRAVEL_STATUS.DRAFT]: [TRAVEL_STATUS.SUBMITTED, TRAVEL_STATUS.CANCELLED],
  [TRAVEL_STATUS.SUBMITTED]: [TRAVEL_STATUS.APPROVED, TRAVEL_STATUS.REJECTED, TRAVEL_STATUS.CANCELLED],
  [TRAVEL_STATUS.APPROVED]: [TRAVEL_STATUS.BOOKED, TRAVEL_STATUS.CANCELLED],
  [TRAVEL_STATUS.BOOKED]: [TRAVEL_STATUS.IN_PROGRESS, TRAVEL_STATUS.COMPLETED, TRAVEL_STATUS.CANCELLED],
  [TRAVEL_STATUS.IN_PROGRESS]: [TRAVEL_STATUS.COMPLETED, TRAVEL_STATUS.CANCELLED],
  [TRAVEL_STATUS.REJECTED]: [],
  [TRAVEL_STATUS.COMPLETED]: [],
  [TRAVEL_STATUS.CANCELLED]: [],
};

async function transition({ organizationId, id, toStatus, approverUserId, note, bookingReference, actualCost }) {
  const row = await models.TravelRequest.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!row) throw AppError.notFound('Travel request not found');
  const allowed = TRAVEL_TRANSITIONS[row.status] || [];
  if (!allowed.includes(toStatus)) {
    throw AppError.conflict(`Cannot move a travel request from ${row.status} to ${toStatus}`);
  }
  if (toStatus === TRAVEL_STATUS.BOOKED && !bookingReference && !row.booking_reference) {
    throw AppError.unprocessable('A booking reference is required to book travel');
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
  if (toStatus === TRAVEL_STATUS.COMPLETED && actualCost !== undefined && actualCost !== null) {
    row.actual_cost = actualCost;
  }
  await row.save();
  return row;
}

module.exports = { submit, transition };
