'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/hrValidators');

const workingSchedule = require('../controllers/workingScheduleController');
const attendance = require('../controllers/attendanceController');
const timeOffType = require('../controllers/timeOffTypeController');
const timeOffAllocation = require('../controllers/timeOffAllocationController');
const timeOffRequest = require('../controllers/timeOffRequestController');
const feedback = require('../controllers/feedbackController');
const hrRequest = require('../controllers/hrRequestController');
const announcement = require('../controllers/announcementController');
const chat = require('../controllers/hrChatController');
const dashboard = require('../controllers/hrDashboardController');

const router = express.Router();
router.use(requireAuth);

// Working schedules
router.get('/working-schedules', requirePermission(PERMISSIONS.WORKING_SCHEDULE_READ), asyncHandler(workingSchedule.list));
router.post(
  '/working-schedules',
  requirePermission(PERMISSIONS.WORKING_SCHEDULE_WRITE),
  validate({ body: V.createWorkingSchedule }),
  asyncHandler(workingSchedule.create)
);
router.get(
  '/working-schedules/:id',
  requirePermission(PERMISSIONS.WORKING_SCHEDULE_READ),
  validate({ params: V.idParam }),
  asyncHandler(workingSchedule.getOne)
);
router.patch(
  '/working-schedules/:id',
  requirePermission(PERMISSIONS.WORKING_SCHEDULE_WRITE),
  validate({ params: V.idParam, body: V.updateWorkingSchedule }),
  asyncHandler(workingSchedule.update)
);
router.delete(
  '/working-schedules/:id',
  requirePermission(PERMISSIONS.WORKING_SCHEDULE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(workingSchedule.remove)
);

// Attendance
router.get('/attendance', requirePermission(PERMISSIONS.ATTENDANCE_READ), asyncHandler(attendance.list));
router.get('/attendance/summary', requirePermission(PERMISSIONS.ATTENDANCE_READ), asyncHandler(attendance.summary));
router.post(
  '/attendance/check-in',
  requireAnyPermission(PERMISSIONS.ATTENDANCE_SELF_WRITE, PERMISSIONS.ATTENDANCE_WRITE),
  validate({ body: V.checkIn }),
  asyncHandler(attendance.checkIn)
);
router.post(
  '/attendance/check-out',
  requireAnyPermission(PERMISSIONS.ATTENDANCE_SELF_WRITE, PERMISSIONS.ATTENDANCE_WRITE),
  validate({ body: V.checkOut }),
  asyncHandler(attendance.checkOut)
);
router.get(
  '/attendance/:id',
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validate({ params: V.idParam }),
  asyncHandler(attendance.getOne)
);
router.patch(
  '/attendance/:id/correct',
  requirePermission(PERMISSIONS.ATTENDANCE_CORRECT),
  validate({ params: V.idParam, body: V.correctAttendance }),
  asyncHandler(attendance.correct)
);
router.delete(
  '/attendance/:id',
  requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(attendance.remove)
);

// Time off types
router.get('/time-off/types', requirePermission(PERMISSIONS.TIME_OFF_TYPE_READ), asyncHandler(timeOffType.list));
router.post(
  '/time-off/types',
  requirePermission(PERMISSIONS.TIME_OFF_TYPE_WRITE),
  validate({ body: V.createTimeOffType }),
  asyncHandler(timeOffType.create)
);
router.get(
  '/time-off/types/:id',
  requirePermission(PERMISSIONS.TIME_OFF_TYPE_READ),
  validate({ params: V.idParam }),
  asyncHandler(timeOffType.getOne)
);
router.patch(
  '/time-off/types/:id',
  requirePermission(PERMISSIONS.TIME_OFF_TYPE_WRITE),
  validate({ params: V.idParam, body: V.updateTimeOffType }),
  asyncHandler(timeOffType.update)
);
router.delete(
  '/time-off/types/:id',
  requirePermission(PERMISSIONS.TIME_OFF_TYPE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(timeOffType.remove)
);

// Time off allocations
router.get('/time-off/allocations', requirePermission(PERMISSIONS.TIME_OFF_ALLOCATION_READ), asyncHandler(timeOffAllocation.list));
router.post(
  '/time-off/allocations',
  requirePermission(PERMISSIONS.TIME_OFF_ALLOCATION_WRITE),
  validate({ body: V.createAllocation }),
  asyncHandler(timeOffAllocation.create)
);
router.get(
  '/time-off/allocations/:id',
  requirePermission(PERMISSIONS.TIME_OFF_ALLOCATION_READ),
  validate({ params: V.idParam }),
  asyncHandler(timeOffAllocation.getOne)
);
router.post(
  '/time-off/allocations/:id/approve',
  requirePermission(PERMISSIONS.TIME_OFF_ALLOCATION_APPROVE),
  validate({ params: V.idParam }),
  asyncHandler(timeOffAllocation.approve)
);
router.post(
  '/time-off/allocations/:id/refuse',
  requirePermission(PERMISSIONS.TIME_OFF_ALLOCATION_APPROVE),
  validate({ params: V.idParam }),
  asyncHandler(timeOffAllocation.refuse)
);
router.delete(
  '/time-off/allocations/:id',
  requirePermission(PERMISSIONS.TIME_OFF_ALLOCATION_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(timeOffAllocation.remove)
);

// Time off requests
router.get('/time-off/requests', requirePermission(PERMISSIONS.TIME_OFF_REQUEST_READ), asyncHandler(timeOffRequest.list));
router.post(
  '/time-off/requests',
  requirePermission(PERMISSIONS.TIME_OFF_REQUEST_WRITE),
  validate({ body: V.submitTimeOffRequest }),
  asyncHandler(timeOffRequest.submit)
);
router.get(
  '/time-off/requests/:id',
  requirePermission(PERMISSIONS.TIME_OFF_REQUEST_READ),
  validate({ params: V.idParam }),
  asyncHandler(timeOffRequest.getOne)
);
router.post(
  '/time-off/requests/:id/approve',
  requirePermission(PERMISSIONS.TIME_OFF_REQUEST_APPROVE),
  validate({ params: V.idParam, body: V.decideTimeOffRequest }),
  asyncHandler(timeOffRequest.approve)
);
router.post(
  '/time-off/requests/:id/refuse',
  requirePermission(PERMISSIONS.TIME_OFF_REQUEST_APPROVE),
  validate({ params: V.idParam, body: V.decideTimeOffRequest }),
  asyncHandler(timeOffRequest.refuse)
);
router.post(
  '/time-off/requests/:id/cancel',
  requirePermission(PERMISSIONS.TIME_OFF_REQUEST_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(timeOffRequest.cancel)
);

// Feedback (submission is broadly available; even employees may submit)
router.get('/feedback', requirePermission(PERMISSIONS.FEEDBACK_READ), asyncHandler(feedback.list));
router.post(
  '/feedback',
  requirePermission(PERMISSIONS.FEEDBACK_WRITE),
  validate({ body: V.submitFeedback }),
  asyncHandler(feedback.submit)
);
router.get(
  '/feedback/:id',
  requirePermission(PERMISSIONS.FEEDBACK_READ),
  validate({ params: V.idParam }),
  asyncHandler(feedback.getOne)
);
router.patch(
  '/feedback/:id/status',
  requirePermission(PERMISSIONS.FEEDBACK_READ),
  validate({ params: V.idParam, body: V.updateFeedbackStatus }),
  asyncHandler(feedback.updateStatus)
);

// HR requests (chat channel between employee and HR)
router.get('/requests', requirePermission(PERMISSIONS.HR_REQUEST_READ), asyncHandler(hrRequest.list));
router.post(
  '/requests',
  requirePermission(PERMISSIONS.HR_REQUEST_WRITE),
  validate({ body: V.createHrRequest }),
  asyncHandler(hrRequest.create)
);
router.get(
  '/requests/:id',
  requirePermission(PERMISSIONS.HR_REQUEST_READ),
  validate({ params: V.idParam }),
  asyncHandler(hrRequest.getOne)
);
router.post(
  '/requests/:id/messages',
  requirePermission(PERMISSIONS.HR_REQUEST_WRITE),
  validate({ params: V.idParam, body: V.replyHrRequest }),
  asyncHandler(hrRequest.reply)
);
router.patch(
  '/requests/:id/status',
  requirePermission(PERMISSIONS.HR_REQUEST_READ),
  validate({ params: V.idParam, body: V.updateHrRequestStatus }),
  asyncHandler(hrRequest.updateStatus)
);

// Announcements
router.get('/announcements', asyncHandler(announcement.list));
router.post(
  '/announcements',
  requirePermission(PERMISSIONS.HR_REQUEST_READ),
  validate({ body: V.createAnnouncement }),
  asyncHandler(announcement.create)
);
router.patch(
  '/announcements/:id',
  requirePermission(PERMISSIONS.HR_REQUEST_READ),
  validate({ params: V.idParam, body: V.updateAnnouncement }),
  asyncHandler(announcement.update)
);
router.delete(
  '/announcements/:id',
  requirePermission(PERMISSIONS.HR_REQUEST_READ),
  validate({ params: V.idParam }),
  asyncHandler(announcement.remove)
);

// AI chat surface (stub, connects to Python AI service in a later push)
router.post('/chat/ask', requirePermission(PERMISSIONS.HR_CHAT_WRITE), validate({ body: V.hrChatAsk }), asyncHandler(chat.ask));

// HR dashboard
router.get('/dashboard/overview', requirePermission(PERMISSIONS.HR_REQUEST_READ), asyncHandler(dashboard.overview));

module.exports = router;
