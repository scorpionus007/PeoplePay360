'use strict';

const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { ATTENDANCE_STATUS } = require('../../../config/constants');

const OVERTIME_THRESHOLD_HOURS = 9;

function toWorkDate(dt) {
  return dayjs(dt).format('YYYY-MM-DD');
}

function diffHours(fromDate, toDate, breakMinutes = 0) {
  const from = dayjs(fromDate);
  const to = dayjs(toDate);
  if (!from.isValid() || !to.isValid() || to.isBefore(from)) return 0;
  const minutes = Math.max(0, to.diff(from, 'minute') - Number(breakMinutes || 0));
  return Math.round((minutes / 60) * 100) / 100;
}

function deriveStatus(worked, expected = 8) {
  if (worked === 0) return ATTENDANCE_STATUS.PRESENT;
  if (worked >= OVERTIME_THRESHOLD_HOURS) return ATTENDANCE_STATUS.OVERTIME;
  if (worked < expected) return ATTENDANCE_STATUS.EARLY_LEAVE;
  return ATTENDANCE_STATUS.PRESENT;
}

async function checkIn({ organizationId, employeeId, at, source, ip, lat, lng }) {
  const date = toWorkDate(at || new Date());
  return sequelize.transaction(async (transaction) => {
    const existing = await models.Attendance.findOne({
      where: { organization_id: organizationId, employee_id: employeeId, work_date: date },
      transaction,
    });
    if (existing && existing.check_in) {
      throw AppError.conflict('Already checked in for this day', { attendance_id: existing.id });
    }
    if (existing) {
      existing.check_in = at || new Date();
      existing.source = source || existing.source;
      existing.check_in_ip = ip || existing.check_in_ip;
      existing.check_in_lat = lat ?? existing.check_in_lat;
      existing.check_in_lng = lng ?? existing.check_in_lng;
      await existing.save({ transaction });
      return existing;
    }
    return models.Attendance.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        work_date: date,
        check_in: at || new Date(),
        source: source || 'self',
        check_in_ip: ip || null,
        check_in_lat: lat ?? null,
        check_in_lng: lng ?? null,
        status: ATTENDANCE_STATUS.PRESENT,
      },
      { transaction }
    );
  });
}

async function checkOut({ organizationId, employeeId, at, ip, lat, lng }) {
  const date = toWorkDate(at || new Date());
  const record = await models.Attendance.findOne({
    where: { organization_id: organizationId, employee_id: employeeId, work_date: date },
  });
  if (!record || !record.check_in) throw AppError.badRequest('No open check in for the current work date');
  if (record.check_out) throw AppError.conflict('Already checked out for this day');

  const now = at || new Date();
  const worked = diffHours(record.check_in, now, record.break_minutes);
  record.check_out = now;
  record.worked_hours = worked;
  record.overtime_hours = Math.max(0, worked - OVERTIME_THRESHOLD_HOURS);
  record.status = deriveStatus(worked);
  record.check_out_ip = ip || null;
  record.check_out_lat = lat ?? null;
  record.check_out_lng = lng ?? null;
  await record.save();
  return record;
}

async function correct({ organizationId, id, correctorUserId, patch, note }) {
  const record = await models.Attendance.findOne({ where: { id, organization_id: organizationId } });
  if (!record) throw AppError.notFound('Attendance record not found');

  const merged = { ...record.get(), ...patch };
  if (merged.check_in && merged.check_out) {
    merged.worked_hours = diffHours(merged.check_in, merged.check_out, merged.break_minutes || 0);
    merged.overtime_hours = Math.max(0, merged.worked_hours - OVERTIME_THRESHOLD_HOURS);
    merged.status = merged.status || deriveStatus(merged.worked_hours);
  }
  merged.is_corrected = true;
  merged.corrected_by = correctorUserId;
  merged.corrected_at = new Date();
  merged.correction_note = note || merged.correction_note || null;

  await record.update(merged);
  return record;
}

async function summary({ organizationId, employeeId, from, to }) {
  const rows = await models.Attendance.findAll({
    where: {
      organization_id: organizationId,
      ...(employeeId ? { employee_id: employeeId } : {}),
      work_date: { [Op.between]: [from, to] },
    },
  });

  const totals = {
    days_present: 0,
    days_late: 0,
    days_absent: 0,
    days_on_leave: 0,
    days_missing_checkout: 0,
    total_worked_hours: 0,
    total_overtime_hours: 0,
    manually_edited: 0,
  };
  for (const row of rows) {
    totals.total_worked_hours += Number(row.worked_hours || 0);
    totals.total_overtime_hours += Number(row.overtime_hours || 0);
    if (row.is_corrected) totals.manually_edited += 1;
    if (row.status === ATTENDANCE_STATUS.ABSENT) totals.days_absent += 1;
    else if (row.status === ATTENDANCE_STATUS.ON_LEAVE) totals.days_on_leave += 1;
    else if (row.status === ATTENDANCE_STATUS.LATE) totals.days_late += 1;
    else if (!row.check_out) totals.days_missing_checkout += 1;
    else totals.days_present += 1;
  }
  totals.total_worked_hours = Math.round(totals.total_worked_hours * 100) / 100;
  totals.total_overtime_hours = Math.round(totals.total_overtime_hours * 100) / 100;
  return totals;
}

module.exports = { checkIn, checkOut, correct, summary, diffHours };
