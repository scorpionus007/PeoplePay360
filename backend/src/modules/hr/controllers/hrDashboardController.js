'use strict';

const { Op, fn, col } = require('sequelize');
const { models } = require('../../../models');
const { success } = require('../../../utils/response');
const attendance = require('../services/attendance.service');
const {
  TIME_OFF_REQUEST_STATUS,
  ATTENDANCE_STATUS,
  FEEDBACK_STATUS,
  HR_REQUEST_STATUS,
} = require('../../../config/constants');

async function overview(req, res) {
  const orgId = req.user.organizationId;
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const from = req.query.from || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  })();

  const [
    totalEmployees,
    activeEmployees,
    pendingTimeOff,
    approvedTimeOffPeriod,
    pendingAllocations,
    openHrRequests,
    newFeedback,
    escalatedFeedback,
    attendanceStatusCounts,
    manuallyEdited,
  ] = await Promise.all([
    models.Employee.count({ where: { organization_id: orgId } }),
    models.Employee.count({ where: { organization_id: orgId, employment_status: 'active' } }),
    models.TimeOffRequest.count({ where: { organization_id: orgId, status: TIME_OFF_REQUEST_STATUS.PENDING } }),
    models.TimeOffRequest.count({
      where: {
        organization_id: orgId,
        status: TIME_OFF_REQUEST_STATUS.APPROVED,
        start_date: { [Op.lte]: to },
        end_date: { [Op.gte]: from },
      },
    }),
    models.TimeOffAllocation.count({
      where: { organization_id: orgId, status: 'pending_approval' },
    }),
    models.HRRequest.count({
      where: { organization_id: orgId, status: { [Op.in]: [HR_REQUEST_STATUS.OPEN, HR_REQUEST_STATUS.IN_PROGRESS] } },
    }),
    models.FeedbackEntry.count({ where: { organization_id: orgId, status: FEEDBACK_STATUS.NEW } }),
    models.FeedbackEntry.count({ where: { organization_id: orgId, status: FEEDBACK_STATUS.ESCALATED } }),
    models.Attendance.findAll({
      where: { organization_id: orgId, work_date: { [Op.between]: [from, to] } },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    models.Attendance.count({
      where: { organization_id: orgId, is_corrected: true, work_date: { [Op.between]: [from, to] } },
    }),
  ]);

  const attendanceBuckets = { present: 0, late: 0, absent: 0, on_leave: 0, overtime: 0, missing_checkout: 0 };
  for (const row of attendanceStatusCounts) {
    if (attendanceBuckets[row.status] !== undefined) {
      attendanceBuckets[row.status] = Number(row.count || 0);
    }
  }

  const attendanceSummary = await attendance.summary({ organizationId: orgId, employeeId: null, from, to });

  return success(res, {
    range: { from, to },
    kpis: {
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      pending_time_off_requests: pendingTimeOff,
      approved_time_off_in_range: approvedTimeOffPeriod,
      pending_allocations: pendingAllocations,
      open_hr_requests: openHrRequests,
      new_feedback: newFeedback,
      escalated_feedback: escalatedFeedback,
      manually_edited_attendance: manuallyEdited,
    },
    attendance: {
      buckets: attendanceBuckets,
      totals: attendanceSummary,
      overtime_status_key: ATTENDANCE_STATUS.OVERTIME,
    },
  });
}

module.exports = { overview };
