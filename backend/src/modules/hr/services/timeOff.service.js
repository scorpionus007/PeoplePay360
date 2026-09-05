'use strict';

const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  TIME_OFF_ALLOCATION_STATUS,
  TIME_OFF_REQUEST_STATUS,
  TIME_OFF_UNIT,
} = require('../../../config/constants');

function durationFrom({ startDate, endDate, isHalfDay, unit }) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return 0;
  const days = end.diff(start, 'day') + 1;
  if (unit === TIME_OFF_UNIT.HOURS) return days * 8;
  return isHalfDay ? 0.5 : days;
}

async function findApplicableAllocation({ employeeId, typeId, on, transaction }) {
  return models.TimeOffAllocation.findOne({
    where: {
      employee_id: employeeId,
      time_off_type_id: typeId,
      status: TIME_OFF_ALLOCATION_STATUS.APPROVED,
      valid_from: { [Op.lte]: on },
      [Op.or]: [{ valid_to: null }, { valid_to: { [Op.gte]: on } }],
    },
    order: [['valid_from', 'DESC']],
    transaction,
  });
}

async function createAllocation({ organizationId, payload, actorUserId }) {
  return sequelize.transaction(async (transaction) => {
    const type = await models.TimeOffType.findOne({
      where: { id: payload.time_off_type_id, organization_id: organizationId },
      transaction,
    });
    if (!type) throw AppError.badRequest('Unknown time off type');

    const allocation = await models.TimeOffAllocation.create(
      {
        organization_id: organizationId,
        employee_id: payload.employee_id,
        time_off_type_id: payload.time_off_type_id,
        allocated_amount: payload.allocated_amount,
        valid_from: payload.valid_from,
        valid_to: payload.valid_to || null,
        allocation_note: payload.allocation_note || null,
        status: TIME_OFF_ALLOCATION_STATUS.PENDING_APPROVAL,
        approved_by: null,
      },
      { transaction }
    );
    return allocation;
  });
}

async function approveAllocation({ organizationId, id, approverUserId }) {
  const allocation = await models.TimeOffAllocation.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!allocation) throw AppError.notFound('Allocation not found');
  if (allocation.status !== TIME_OFF_ALLOCATION_STATUS.PENDING_APPROVAL) {
    throw AppError.conflict('Allocation is not pending approval');
  }
  allocation.status = TIME_OFF_ALLOCATION_STATUS.APPROVED;
  allocation.approved_by = approverUserId;
  allocation.approved_at = new Date();
  await allocation.save();
  return allocation;
}

async function refuseAllocation({ organizationId, id }) {
  const allocation = await models.TimeOffAllocation.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!allocation) throw AppError.notFound('Allocation not found');
  allocation.status = TIME_OFF_ALLOCATION_STATUS.REFUSED;
  await allocation.save();
  return allocation;
}

async function submitRequest({ organizationId, employeeId, payload }) {
  return sequelize.transaction(async (transaction) => {
    const type = await models.TimeOffType.findOne({
      where: { id: payload.time_off_type_id, organization_id: organizationId },
      transaction,
    });
    if (!type) throw AppError.badRequest('Unknown time off type');

    const duration = durationFrom({
      startDate: payload.start_date,
      endDate: payload.end_date,
      isHalfDay: payload.is_half_day,
      unit: type.unit,
    });
    if (duration <= 0) throw AppError.badRequest('Request duration must be greater than zero');

    let allocation = null;
    if (type.requires_allocation) {
      allocation = await findApplicableAllocation({
        employeeId,
        typeId: type.id,
        on: payload.start_date,
        transaction,
      });
      if (!allocation) {
        throw AppError.unprocessable('No approved allocation covers this leave', {
          time_off_type: type.code,
        });
      }
      const remaining = allocation.remaining();
      if (remaining < duration) {
        throw AppError.unprocessable('Not enough remaining balance for this leave', {
          remaining,
          requested: duration,
          unit: type.unit,
        });
      }
      // Reserve balance while pending.
      allocation.pending_amount = Number(allocation.pending_amount || 0) + duration;
      await allocation.save({ transaction });
    }

    const request = await models.TimeOffRequest.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        time_off_type_id: type.id,
        time_off_allocation_id: allocation ? allocation.id : null,
        start_date: payload.start_date,
        end_date: payload.end_date,
        is_half_day: !!payload.is_half_day,
        half_day_period: payload.half_day_period || null,
        duration,
        reason: payload.reason || null,
        status: type.requires_approval
          ? TIME_OFF_REQUEST_STATUS.PENDING
          : TIME_OFF_REQUEST_STATUS.APPROVED,
        submitted_at: new Date(),
      },
      { transaction }
    );

    if (!type.requires_approval && allocation) {
      allocation.pending_amount = Math.max(0, Number(allocation.pending_amount) - duration);
      allocation.taken_amount = Number(allocation.taken_amount || 0) + duration;
      await allocation.save({ transaction });
    }

    return request;
  });
}

async function approveRequest({ organizationId, id, approverUserId, note }) {
  return sequelize.transaction(async (transaction) => {
    const request = await models.TimeOffRequest.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!request) throw AppError.notFound('Time off request not found');
    if (request.status !== TIME_OFF_REQUEST_STATUS.PENDING) {
      throw AppError.conflict('Request is not pending');
    }

    request.status = TIME_OFF_REQUEST_STATUS.APPROVED;
    request.approver_id = approverUserId;
    request.decided_at = new Date();
    request.decision_note = note || null;
    await request.save({ transaction });

    if (request.time_off_allocation_id) {
      const allocation = await models.TimeOffAllocation.findByPk(request.time_off_allocation_id, {
        transaction,
      });
      if (allocation) {
        const duration = Number(request.duration);
        allocation.pending_amount = Math.max(0, Number(allocation.pending_amount || 0) - duration);
        allocation.taken_amount = Number(allocation.taken_amount || 0) + duration;
        await allocation.save({ transaction });
      }
    }

    return request;
  });
}

async function refuseRequest({ organizationId, id, approverUserId, note }) {
  return sequelize.transaction(async (transaction) => {
    const request = await models.TimeOffRequest.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!request) throw AppError.notFound('Time off request not found');
    if (![TIME_OFF_REQUEST_STATUS.PENDING].includes(request.status)) {
      throw AppError.conflict('Request cannot be refused in current state');
    }

    request.status = TIME_OFF_REQUEST_STATUS.REFUSED;
    request.approver_id = approverUserId;
    request.decided_at = new Date();
    request.decision_note = note || null;
    await request.save({ transaction });

    if (request.time_off_allocation_id) {
      const allocation = await models.TimeOffAllocation.findByPk(request.time_off_allocation_id, {
        transaction,
      });
      if (allocation) {
        allocation.pending_amount = Math.max(
          0,
          Number(allocation.pending_amount || 0) - Number(request.duration)
        );
        await allocation.save({ transaction });
      }
    }

    return request;
  });
}

async function cancelRequest({ organizationId, id, actorUserId }) {
  return sequelize.transaction(async (transaction) => {
    const request = await models.TimeOffRequest.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!request) throw AppError.notFound('Time off request not found');
    if ([TIME_OFF_REQUEST_STATUS.CANCELLED, TIME_OFF_REQUEST_STATUS.REFUSED].includes(request.status)) {
      throw AppError.conflict('Request is not cancellable in current state');
    }

    const wasApproved = request.status === TIME_OFF_REQUEST_STATUS.APPROVED;
    const wasPending = request.status === TIME_OFF_REQUEST_STATUS.PENDING;
    request.status = TIME_OFF_REQUEST_STATUS.CANCELLED;
    request.cancelled_at = new Date();
    await request.save({ transaction });

    if (request.time_off_allocation_id && (wasApproved || wasPending)) {
      const allocation = await models.TimeOffAllocation.findByPk(request.time_off_allocation_id, {
        transaction,
      });
      if (allocation) {
        const duration = Number(request.duration);
        if (wasApproved) {
          allocation.taken_amount = Math.max(
            0,
            Number(allocation.taken_amount || 0) - duration
          );
        }
        if (wasPending) {
          allocation.pending_amount = Math.max(
            0,
            Number(allocation.pending_amount || 0) - duration
          );
        }
        await allocation.save({ transaction });
      }
    }
    return request;
  });
}

module.exports = {
  createAllocation,
  approveAllocation,
  refuseAllocation,
  submitRequest,
  approveRequest,
  refuseRequest,
  cancelRequest,
  durationFrom,
};
