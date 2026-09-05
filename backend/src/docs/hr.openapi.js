'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     WorkingSchedule:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         code: { type: string, nullable: true }
 *         schedule_type: { type: string, enum: [standard, flexible, shift, part_time, custom] }
 *         timezone: { type: string }
 *         weekly_hours: { type: number }
 *         is_active: { type: boolean }
 *         days:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day_of_week: { type: string, enum: [mon, tue, wed, thu, fri, sat, sun] }
 *               block_index: { type: integer, example: 1 }
 *               start_time: { type: string, example: '09:00' }
 *               end_time: { type: string, example: '18:00' }
 *               break_minutes: { type: integer, example: 60 }
 *               is_working: { type: boolean }
 *     Attendance:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         work_date: { $ref: '#/components/schemas/IsoDate' }
 *         check_in: { $ref: '#/components/schemas/Iso8601' }
 *         check_out: { $ref: '#/components/schemas/Iso8601' }
 *         worked_hours: { type: number }
 *         overtime_hours: { type: number }
 *         status: { type: string, enum: [present, late, early_leave, absent, on_leave, holiday, weekend, overtime, missing_checkout] }
 *         source: { type: string, enum: [self, device, manual, import, geo] }
 *         is_corrected: { type: boolean }
 *     TimeOffType:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         name: { type: string }
 *         color: { type: string, example: '#2563eb' }
 *         unit: { type: string, enum: [days, hours] }
 *         requires_allocation: { type: boolean }
 *         requires_approval: { type: boolean }
 *         paid: { type: boolean }
 *         affects_payroll: { type: boolean }
 *         default_allocation: { type: number }
 *     TimeOffAllocation:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         time_off_type_id: { $ref: '#/components/schemas/Uuid' }
 *         allocated_amount: { type: number }
 *         taken_amount: { type: number }
 *         pending_amount: { type: number }
 *         remaining_amount: { type: number }
 *         valid_from: { $ref: '#/components/schemas/IsoDate' }
 *         valid_to: { $ref: '#/components/schemas/IsoDate' }
 *         status: { type: string, enum: [draft, pending_approval, approved, refused, expired] }
 *     TimeOffRequest:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         time_off_type_id: { $ref: '#/components/schemas/Uuid' }
 *         start_date: { $ref: '#/components/schemas/IsoDate' }
 *         end_date: { $ref: '#/components/schemas/IsoDate' }
 *         is_half_day: { type: boolean }
 *         duration: { type: number }
 *         status: { type: string, enum: [draft, pending, approved, refused, cancelled] }
 *         reason: { type: string, nullable: true }
 *     FeedbackEntry:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         is_anonymous: { type: boolean }
 *         category: { type: string, enum: [appreciation, complaint, suggestion, harassment, safety, policy, manager, peer, other] }
 *         subject: { type: string }
 *         body: { type: string }
 *         priority: { type: string, enum: [low, normal, high, critical] }
 *         status: { type: string, enum: [new, under_review, action_taken, escalated, closed] }
 *     HRRequest:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         request_type: { type: string, enum: [document, letter, policy_query, salary_query, it_query, benefits_query, general] }
 *         subject: { type: string }
 *         body: { type: string }
 *         status: { type: string, enum: [open, in_progress, waiting_on_employee, resolved, cancelled] }
 *         priority: { type: string, enum: [low, normal, high, urgent] }
 *         assigned_to: { $ref: '#/components/schemas/Uuid' }
 *
 * /hr/working-schedules:
 *   get: { tags: ['HR: Working Schedules'], summary: List working schedules with day rows, responses: { 200: { description: OK } } }
 *   post: { tags: ['HR: Working Schedules'], summary: Create schedule with day rows, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/WorkingSchedule' } } } }, responses: { 201: { description: Created } } }
 * /hr/working-schedules/{id}:
 *   get: { tags: ['HR: Working Schedules'], summary: Get schedule, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['HR: Working Schedules'], summary: Update schedule and replace days, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['HR: Working Schedules'], summary: Delete schedule, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /hr/attendance:
 *   get:
 *     tags: ['HR: Attendance']
 *     summary: List attendance records
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: employee_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *       - { name: status, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 * /hr/attendance/summary:
 *   get:
 *     tags: ['HR: Attendance']
 *     summary: Range summary of attendance status counts and totals
 *     parameters:
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *       - { name: employee_id, in: query, schema: { type: string, format: uuid } }
 *     responses: { 200: { description: OK } }
 * /hr/attendance/check-in:
 *   post:
 *     tags: ['HR: Attendance']
 *     summary: Check in for today
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               at: { $ref: '#/components/schemas/Iso8601' }
 *               source: { type: string, enum: [self, device, manual, import, geo] }
 *               lat: { type: number }
 *               lng: { type: number }
 *     responses: { 201: { description: Checked in }, 409: { $ref: '#/components/responses/Conflict' } }
 * /hr/attendance/check-out:
 *   post:
 *     tags: ['HR: Attendance']
 *     summary: Check out for today
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               at: { $ref: '#/components/schemas/Iso8601' }
 *               lat: { type: number }
 *               lng: { type: number }
 *     responses: { 200: { description: Checked out }, 400: { $ref: '#/components/responses/ValidationError' } }
 * /hr/attendance/{id}:
 *   get: { tags: ['HR: Attendance'], summary: Get attendance record, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   delete: { tags: ['HR: Attendance'], summary: Delete attendance record, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /hr/attendance/{id}/correct:
 *   patch:
 *     tags: ['HR: Attendance']
 *     summary: Correct an attendance record
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note: { type: string }
 *               patch:
 *                 type: object
 *                 properties:
 *                   check_in: { $ref: '#/components/schemas/Iso8601' }
 *                   check_out: { $ref: '#/components/schemas/Iso8601' }
 *                   break_minutes: { type: integer }
 *                   status: { type: string }
 *                   notes: { type: string }
 *     responses: { 200: { description: Corrected } }
 *
 * /hr/time-off/types:
 *   get: { tags: ['HR: Time Off Types'], summary: List types, responses: { 200: { description: OK } } }
 *   post: { tags: ['HR: Time Off Types'], summary: Create type, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/TimeOffType' } } } }, responses: { 201: { description: Created } } }
 * /hr/time-off/types/{id}:
 *   get: { tags: ['HR: Time Off Types'], summary: Get type, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['HR: Time Off Types'], summary: Update type, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['HR: Time Off Types'], summary: Delete type, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /hr/time-off/allocations:
 *   get: { tags: ['HR: Time Off Allocations'], summary: List allocations, responses: { 200: { description: OK } } }
 *   post: { tags: ['HR: Time Off Allocations'], summary: Create allocation (pending approval), requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/TimeOffAllocation' } } } }, responses: { 201: { description: Created } } }
 * /hr/time-off/allocations/{id}:
 *   get: { tags: ['HR: Time Off Allocations'], summary: Get allocation with balances, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   delete: { tags: ['HR: Time Off Allocations'], summary: Delete allocation, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /hr/time-off/allocations/{id}/approve:
 *   post: { tags: ['HR: Time Off Allocations'], summary: Approve allocation, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /hr/time-off/allocations/{id}/refuse:
 *   post: { tags: ['HR: Time Off Allocations'], summary: Refuse allocation, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Refused } } }
 *
 * /hr/time-off/requests:
 *   get: { tags: ['HR: Time Off Requests'], summary: List requests, responses: { 200: { description: OK } } }
 *   post: { tags: ['HR: Time Off Requests'], summary: Submit a time off request (reserves balance), requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/TimeOffRequest' } } } }, responses: { 201: { description: Submitted }, 422: { $ref: '#/components/responses/ValidationError' } } }
 * /hr/time-off/requests/{id}:
 *   get: { tags: ['HR: Time Off Requests'], summary: Get request, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /hr/time-off/requests/{id}/approve:
 *   post: { tags: ['HR: Time Off Requests'], summary: Approve request (consumes reserved balance), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /hr/time-off/requests/{id}/refuse:
 *   post: { tags: ['HR: Time Off Requests'], summary: Refuse request (releases reservation), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Refused } } }
 * /hr/time-off/requests/{id}/cancel:
 *   post: { tags: ['HR: Time Off Requests'], summary: Cancel request, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 *
 * /hr/feedback:
 *   get: { tags: ['HR: Feedback'], summary: List feedback (anonymous entries have identity stripped), responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['HR: Feedback']
 *     summary: Submit feedback (supports anonymous)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, subject, body]
 *             properties:
 *               anonymous: { type: boolean }
 *               category: { type: string }
 *               subject: { type: string }
 *               body: { type: string }
 *               priority: { type: string, enum: [low, normal, high, critical] }
 *     responses: { 201: { description: Submitted } }
 * /hr/feedback/{id}:
 *   get: { tags: ['HR: Feedback'], summary: Get feedback entry, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /hr/feedback/{id}/status:
 *   patch: { tags: ['HR: Feedback'], summary: Update feedback status, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *
 * /hr/requests:
 *   get: { tags: ['HR: Requests'], summary: List HR requests, responses: { 200: { description: OK } } }
 *   post: { tags: ['HR: Requests'], summary: Create HR request, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/HRRequest' } } } }, responses: { 201: { description: Created } } }
 * /hr/requests/{id}:
 *   get: { tags: ['HR: Requests'], summary: Get request with thread, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /hr/requests/{id}/messages:
 *   post:
 *     tags: ['HR: Requests']
 *     summary: Reply into a request thread
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body: { type: string }
 *               internal_note: { type: boolean }
 *               assign_to_self: { type: boolean }
 *     responses: { 201: { description: Replied } }
 * /hr/requests/{id}/status:
 *   patch: { tags: ['HR: Requests'], summary: Update HR request status, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *
 * /hr/announcements:
 *   get: { tags: ['HR: Announcements'], summary: List announcements, responses: { 200: { description: OK } } }
 *   post: { tags: ['HR: Announcements'], summary: Create announcement, responses: { 201: { description: Created } } }
 * /hr/announcements/{id}:
 *   patch: { tags: ['HR: Announcements'], summary: Update announcement, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['HR: Announcements'], summary: Delete announcement, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /hr/chat/ask:
 *   post:
 *     tags: ['HR: Chat']
 *     summary: Ask the AI assistant (stub; wired to Python AI service in a later push)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               thread_id: { type: string }
 *               question: { type: string }
 *               context: { type: object }
 *     responses: { 200: { description: OK } }
 *
 * /hr/dashboard/overview:
 *   get:
 *     tags: ['HR: Dashboard']
 *     summary: HR KPIs, attendance buckets, and totals
 *     parameters:
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: OK } }
 */
module.exports = {};
