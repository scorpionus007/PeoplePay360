'use strict';

const Joi = require('joi');
const {
  TIME_OFF_UNIT,
  TIME_OFF_REQUEST_STATUS,
  FEEDBACK_CATEGORY,
  FEEDBACK_STATUS,
  HR_REQUEST_TYPE,
  HR_REQUEST_STATUS,
  ATTENDANCE_STATUS,
} = require('../../../config/constants');

const uuid = Joi.string().uuid();
const dayOfWeek = Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
const timeHm = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/);

exports.idParam = Joi.object({ id: uuid.required() });

exports.createWorkingSchedule = Joi.object({
  name: Joi.string().max(200).required(),
  code: Joi.string().max(80).allow(null, ''),
  schedule_type: Joi.string().valid('standard', 'flexible', 'shift', 'part_time', 'custom').default('standard'),
  timezone: Joi.string().max(64).default('UTC'),
  is_active: Joi.boolean().default(true),
  description: Joi.string().max(500).allow(null, ''),
  days: Joi.array()
    .items(
      Joi.object({
        day_of_week: dayOfWeek.required(),
        block_index: Joi.number().integer().min(1).max(3).default(1),
        start_time: timeHm.required(),
        end_time: timeHm.required(),
        break_minutes: Joi.number().integer().min(0).max(480).default(0),
        is_working: Joi.boolean().default(true),
      })
    )
    .default([]),
});

exports.updateWorkingSchedule = exports.createWorkingSchedule
  .fork(['name'], (s) => s.optional())
  .keys({});

exports.checkIn = Joi.object({
  employee_id: uuid.allow(null),
  at: Joi.date().iso().allow(null),
  source: Joi.string().valid('self', 'device', 'manual', 'import', 'geo').default('self'),
  lat: Joi.number().min(-90).max(90).allow(null),
  lng: Joi.number().min(-180).max(180).allow(null),
});

exports.checkOut = Joi.object({
  employee_id: uuid.allow(null),
  at: Joi.date().iso().allow(null),
  lat: Joi.number().min(-90).max(90).allow(null),
  lng: Joi.number().min(-180).max(180).allow(null),
});

exports.correctAttendance = Joi.object({
  note: Joi.string().max(500).allow(null, ''),
  patch: Joi.object({
    check_in: Joi.date().iso().allow(null),
    check_out: Joi.date().iso().allow(null),
    break_minutes: Joi.number().integer().min(0).max(480).allow(null),
    status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)).allow(null),
    notes: Joi.string().max(500).allow(null, ''),
  }).default({}),
});

exports.createTimeOffType = Joi.object({
  code: Joi.string().max(80).required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).allow(null, ''),
  color: Joi.string().pattern(/^#([0-9a-fA-F]{6})$/).default('#2563eb'),
  unit: Joi.string().valid(...Object.values(TIME_OFF_UNIT)).default(TIME_OFF_UNIT.DAYS),
  requires_allocation: Joi.boolean().default(true),
  requires_approval: Joi.boolean().default(true),
  paid: Joi.boolean().default(true),
  affects_payroll: Joi.boolean().default(false),
  default_allocation: Joi.number().min(0).max(9999).default(0),
  max_carry_forward: Joi.number().min(0).max(9999).default(0),
  is_active: Joi.boolean().default(true),
});

exports.updateTimeOffType = exports.createTimeOffType
  .fork(['code', 'name'], (s) => s.optional())
  .keys({});

exports.createAllocation = Joi.object({
  employee_id: uuid.required(),
  time_off_type_id: uuid.required(),
  allocated_amount: Joi.number().min(0).max(9999).required(),
  valid_from: Joi.date().iso().required(),
  valid_to: Joi.date().iso().allow(null),
  allocation_note: Joi.string().max(500).allow(null, ''),
});

exports.submitTimeOffRequest = Joi.object({
  employee_id: uuid.allow(null),
  time_off_type_id: uuid.required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required(),
  is_half_day: Joi.boolean().default(false),
  half_day_period: Joi.string().valid('morning', 'afternoon').allow(null),
  reason: Joi.string().max(1000).allow(null, ''),
});

exports.decideTimeOffRequest = Joi.object({
  note: Joi.string().max(1000).allow(null, ''),
});

exports.submitFeedback = Joi.object({
  anonymous: Joi.boolean().default(false),
  category: Joi.string().valid(...Object.values(FEEDBACK_CATEGORY)).required(),
  subject: Joi.string().max(200).required(),
  body: Joi.string().max(20000).required(),
  priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
});

exports.updateFeedbackStatus = Joi.object({
  status: Joi.string().valid(...Object.values(FEEDBACK_STATUS)).required(),
  note: Joi.string().max(2000).allow(null, ''),
});

exports.createHrRequest = Joi.object({
  employee_id: uuid.allow(null),
  request_type: Joi.string().valid(...Object.values(HR_REQUEST_TYPE)).default(HR_REQUEST_TYPE.GENERAL),
  subject: Joi.string().max(200).required(),
  body: Joi.string().max(20000).required(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
});

exports.replyHrRequest = Joi.object({
  body: Joi.string().max(20000).required(),
  internal_note: Joi.boolean().default(false),
  assign_to_self: Joi.boolean().default(false),
});

exports.updateHrRequestStatus = Joi.object({
  status: Joi.string().valid(...Object.values(HR_REQUEST_STATUS)).required(),
  resolution_note: Joi.string().max(2000).allow(null, ''),
});

exports.createAnnouncement = Joi.object({
  title: Joi.string().max(200).required(),
  body: Joi.string().max(20000).required(),
  audience: Joi.string().valid('all', 'department', 'role', 'custom').default('all'),
  audience_ref: Joi.object().default({}),
  is_pinned: Joi.boolean().default(false),
  publish_at: Joi.date().iso().allow(null),
  expires_at: Joi.date().iso().allow(null),
  status: Joi.string().valid('draft', 'scheduled', 'published', 'archived').default('draft'),
});

exports.updateAnnouncement = exports.createAnnouncement
  .fork(['title', 'body'], (s) => s.optional())
  .keys({});

exports.hrChatAsk = Joi.object({
  thread_id: Joi.string().max(120).allow(null, ''),
  question: Joi.string().max(4000).required(),
  context: Joi.object().default({}),
});

exports.timeOffRequestStatusFilter = Joi.string().valid(...Object.values(TIME_OFF_REQUEST_STATUS));
