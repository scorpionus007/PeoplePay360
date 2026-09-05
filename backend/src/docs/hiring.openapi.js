'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     Requisition:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         title: { type: string }
 *         hiring_track: { type: string, enum: [internal, external, intern, freelancer, auditor] }
 *         department_id: { $ref: '#/components/schemas/Uuid' }
 *         hiring_manager_id: { $ref: '#/components/schemas/Uuid' }
 *         employment_type: { type: string, enum: [full_time, part_time, contract, intern, freelancer, auditor] }
 *         headcount: { type: integer }
 *         headcount_filled: { type: integer }
 *         location: { type: string, nullable: true }
 *         remote_allowed: { type: boolean }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         salary_min: { $ref: '#/components/schemas/Money' }
 *         salary_max: { $ref: '#/components/schemas/Money' }
 *         status: { type: string, enum: [draft, pending_approval, approved, on_hold, filled, cancelled] }
 *     JobBoardIntegration:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         vendor: { type: string, enum: [linkedin, indeed, glassdoor, monster, naukri, wellfound, custom] }
 *         display_name: { type: string }
 *         api_base_url: { type: string, format: uri, nullable: true }
 *         status: { type: string, enum: [connected, degraded, disconnected, error] }
 *         is_active: { type: boolean }
 *     JobPosting:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         requisition_id: { $ref: '#/components/schemas/Uuid' }
 *         job_board_id: { $ref: '#/components/schemas/Uuid' }
 *         channel: { type: string, enum: [careers_site, linkedin, indeed, glassdoor, monster, naukri, wellfound, referral_only, custom] }
 *         title: { type: string }
 *         external_url: { type: string, format: uri, nullable: true }
 *         status: { type: string, enum: [draft, published, paused, closed, archived] }
 *         published_at: { $ref: '#/components/schemas/Iso8601' }
 *         applications_count: { type: integer }
 *     Candidate:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         first_name: { type: string }
 *         last_name: { type: string }
 *         email: { type: string, format: email }
 *         phone: { type: string, nullable: true }
 *         current_title: { type: string, nullable: true }
 *         current_company: { type: string, nullable: true }
 *         linkedin_url: { type: string, format: uri, nullable: true }
 *         resume_url: { type: string, format: uri, nullable: true }
 *         years_of_experience: { type: number, nullable: true }
 *         background_check_status: { type: string, enum: [not_requested, requested, in_progress, cleared, flagged] }
 *         is_blacklisted: { type: boolean }
 *     Application:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         candidate_id: { $ref: '#/components/schemas/Uuid' }
 *         requisition_id: { $ref: '#/components/schemas/Uuid' }
 *         job_posting_id: { $ref: '#/components/schemas/Uuid' }
 *         referral_id: { $ref: '#/components/schemas/Uuid' }
 *         source: { type: string, enum: [direct, referral, job_board, agency, sourced, internal, university] }
 *         current_stage: { type: string, enum: [applied, screening, phone_screen, assessment, interview, onsite, offer, hired, rejected, withdrawn, on_hold] }
 *         applied_at: { $ref: '#/components/schemas/Iso8601' }
 *         internal_rating: { type: number, nullable: true }
 *     Interview:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         application_id: { $ref: '#/components/schemas/Uuid' }
 *         round_index: { type: integer }
 *         interview_type: { type: string, enum: [phone, video, onsite, technical, panel, behavioral, culture, take_home] }
 *         title: { type: string }
 *         scheduled_start: { $ref: '#/components/schemas/Iso8601' }
 *         scheduled_end: { $ref: '#/components/schemas/Iso8601' }
 *         timezone: { type: string }
 *         video_url: { type: string, format: uri, nullable: true }
 *         panelists:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user_id: { $ref: '#/components/schemas/Uuid' }
 *               name: { type: string }
 *               role: { type: string }
 *         status: { type: string, enum: [scheduled, completed, cancelled, no_show, rescheduled] }
 *     Offer:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         application_id: { $ref: '#/components/schemas/Uuid' }
 *         candidate_id: { $ref: '#/components/schemas/Uuid' }
 *         requisition_id: { $ref: '#/components/schemas/Uuid' }
 *         title: { type: string }
 *         base_salary: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         salary_period: { type: string, enum: [hourly, daily, weekly, monthly, yearly] }
 *         sign_on_bonus: { $ref: '#/components/schemas/Money' }
 *         annual_bonus_percent: { type: number }
 *         start_date: { $ref: '#/components/schemas/IsoDate' }
 *         expires_at: { $ref: '#/components/schemas/Iso8601' }
 *         status: { type: string, enum: [draft, pending_approval, extended, negotiating, accepted, declined, rescinded, expired] }
 *     Referral:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         referrer_employee_id: { $ref: '#/components/schemas/Uuid' }
 *         requisition_id: { $ref: '#/components/schemas/Uuid' }
 *         candidate_id: { $ref: '#/components/schemas/Uuid' }
 *         candidate_first_name: { type: string }
 *         candidate_last_name: { type: string }
 *         candidate_email: { type: string, format: email }
 *         relationship: { type: string, nullable: true }
 *         status: { type: string, enum: [submitted, in_review, advanced, hired, rejected, bonus_paid, cancelled] }
 *         bonus_amount: { $ref: '#/components/schemas/Money' }
 *
 * /hiring/requisitions:
 *   get:
 *     tags: ['Hiring: Requisitions']
 *     summary: List requisitions
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: department_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: hiring_track, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Hiring: Requisitions'], summary: Create requisition, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Requisition' } } } }, responses: { 201: { description: Created } } }
 * /hiring/requisitions/{id}:
 *   get: { tags: ['Hiring: Requisitions'], summary: Get requisition with postings, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Hiring: Requisitions'], summary: Update requisition, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Hiring: Requisitions'], summary: Delete requisition, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /hiring/requisitions/{id}/submit:
 *   post: { tags: ['Hiring: Requisitions'], summary: Submit requisition for approval, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Submitted } } }
 * /hiring/requisitions/{id}/approve:
 *   post: { tags: ['Hiring: Requisitions'], summary: Approve requisition, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /hiring/requisitions/{id}/hold:
 *   post: { tags: ['Hiring: Requisitions'], summary: Put requisition on hold, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: On hold } } }
 * /hiring/requisitions/{id}/cancel:
 *   post: { tags: ['Hiring: Requisitions'], summary: Cancel requisition, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 *
 * /hiring/job-boards:
 *   get: { tags: ['Hiring: Job Boards'], summary: List integrations (credentials stripped), responses: { 200: { description: OK } } }
 *   post: { tags: ['Hiring: Job Boards'], summary: Register integration, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/JobBoardIntegration' } } } }, responses: { 201: { description: Created } } }
 * /hiring/job-boards/{id}:
 *   patch: { tags: ['Hiring: Job Boards'], summary: Update integration, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Hiring: Job Boards'], summary: Delete integration, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /hiring/postings:
 *   get: { tags: ['Hiring: Job Postings'], summary: List postings, responses: { 200: { description: OK } } }
 *   post: { tags: ['Hiring: Job Postings'], summary: Create posting (requisition must be approved), requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/JobPosting' } } } }, responses: { 201: { description: Created }, 409: { $ref: '#/components/responses/Conflict' } } }
 * /hiring/postings/{id}:
 *   get: { tags: ['Hiring: Job Postings'], summary: Get posting, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Hiring: Job Postings'], summary: Update posting, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Hiring: Job Postings'], summary: Delete posting, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /hiring/postings/{id}/publish:
 *   post: { tags: ['Hiring: Job Postings'], summary: Publish posting, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Published } } }
 * /hiring/postings/{id}/close:
 *   post: { tags: ['Hiring: Job Postings'], summary: Close posting, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Closed } } }
 *
 * /hiring/candidates:
 *   get:
 *     tags: ['Hiring: Candidates']
 *     summary: List candidates
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: is_blacklisted, in: query, schema: { type: boolean } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Hiring: Candidates'], summary: Create candidate, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Candidate' } } } }, responses: { 201: { description: Created } } }
 * /hiring/candidates/{id}:
 *   get: { tags: ['Hiring: Candidates'], summary: Get candidate with applications, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Hiring: Candidates'], summary: Update candidate, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Hiring: Candidates'], summary: Delete candidate, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /hiring/applications:
 *   get:
 *     tags: ['Hiring: Applications']
 *     summary: List applications
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: requisition_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: candidate_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: current_stage, in: query, schema: { type: string } }
 *       - { name: source, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: ['Hiring: Applications']
 *     summary: Submit an application (auto creates candidate by email if new)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requisition_id, candidate]
 *             properties:
 *               requisition_id: { $ref: '#/components/schemas/Uuid' }
 *               job_posting_id: { $ref: '#/components/schemas/Uuid' }
 *               referral_id: { $ref: '#/components/schemas/Uuid' }
 *               source: { type: string, enum: [direct, referral, job_board, agency, sourced, internal, university] }
 *               cover_letter_url: { type: string, format: uri }
 *               candidate:
 *                 type: object
 *                 properties:
 *                   id: { $ref: '#/components/schemas/Uuid' }
 *                   first_name: { type: string }
 *                   last_name: { type: string }
 *                   email: { type: string, format: email }
 *                   phone: { type: string }
 *                   resume_url: { type: string, format: uri }
 *     responses: { 201: { description: Created } }
 * /hiring/applications/{id}:
 *   get: { tags: ['Hiring: Applications'], summary: Get application with history and interviews, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /hiring/applications/{id}/progress:
 *   post:
 *     tags: ['Hiring: Applications']
 *     summary: Move application to a new stage
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to_stage]
 *             properties:
 *               to_stage: { type: string }
 *               note: { type: string }
 *               rejection_reason: { type: string }
 *     responses: { 200: { description: Progressed } }
 * /hiring/applications/{id}/reject:
 *   post: { tags: ['Hiring: Applications'], summary: Reject application, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rejected } } }
 * /hiring/applications/{id}/withdraw:
 *   post: { tags: ['Hiring: Applications'], summary: Withdraw application, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Withdrawn } } }
 *
 * /hiring/interviews:
 *   get:
 *     tags: ['Hiring: Interviews']
 *     summary: List interviews
 *     parameters:
 *       - { name: application_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: from, in: query, schema: { type: string, format: date-time } }
 *       - { name: to, in: query, schema: { type: string, format: date-time } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Hiring: Interviews'], summary: Schedule interview, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Interview' } } } }, responses: { 201: { description: Scheduled } } }
 * /hiring/interviews/{id}:
 *   get: { tags: ['Hiring: Interviews'], summary: Get interview with feedback, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /hiring/interviews/{id}/reschedule:
 *   patch: { tags: ['Hiring: Interviews'], summary: Reschedule interview, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rescheduled } } }
 * /hiring/interviews/{id}/cancel:
 *   post: { tags: ['Hiring: Interviews'], summary: Cancel interview, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 * /hiring/interviews/{id}/feedback:
 *   post:
 *     tags: ['Hiring: Interviews']
 *     summary: Submit interview feedback (upsert per panelist)
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recommendation]
 *             properties:
 *               panelist_role: { type: string }
 *               overall_rating: { type: number, minimum: 0, maximum: 10 }
 *               recommendation: { type: string, enum: [strong_hire, hire, no_hire, strong_no_hire, needs_another_round] }
 *               strengths: { type: string }
 *               concerns: { type: string }
 *               questions_asked: { type: string }
 *               notes: { type: string }
 *               criteria_scores: { type: object }
 *     responses: { 201: { description: Submitted } }
 *
 * /hiring/offers:
 *   get: { tags: ['Hiring: Offers'], summary: List offers, responses: { 200: { description: OK } } }
 *   post: { tags: ['Hiring: Offers'], summary: Draft offer, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Offer' } } } }, responses: { 201: { description: Drafted } } }
 * /hiring/offers/{id}:
 *   get: { tags: ['Hiring: Offers'], summary: Get offer, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Hiring: Offers'], summary: Update draft offer, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Hiring: Offers'], summary: Delete draft offer, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /hiring/offers/{id}/submit:
 *   post: { tags: ['Hiring: Offers'], summary: Submit for approval, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Submitted } } }
 * /hiring/offers/{id}/approve:
 *   post: { tags: ['Hiring: Offers'], summary: Approve offer, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /hiring/offers/{id}/extend:
 *   post: { tags: ['Hiring: Offers'], summary: Extend offer to candidate, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Extended } } }
 * /hiring/offers/{id}/accept:
 *   post: { tags: ['Hiring: Offers'], summary: Candidate accepts (auto marks application hired), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Accepted } } }
 * /hiring/offers/{id}/decline:
 *   post: { tags: ['Hiring: Offers'], summary: Candidate declines, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Declined } } }
 * /hiring/offers/{id}/rescind:
 *   post: { tags: ['Hiring: Offers'], summary: Rescind offer, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rescinded } } }
 *
 * /hiring/referrals:
 *   get: { tags: ['Hiring: Referrals'], summary: List referrals (employees see only their own), responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Hiring: Referrals']
 *     summary: Submit a referral
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [candidate_first_name, candidate_last_name, candidate_email]
 *             properties:
 *               requisition_id: { $ref: '#/components/schemas/Uuid' }
 *               candidate_first_name: { type: string }
 *               candidate_last_name: { type: string }
 *               candidate_email: { type: string, format: email }
 *               candidate_phone: { type: string }
 *               candidate_resume_url: { type: string, format: uri }
 *               relationship: { type: string }
 *               recommendation: { type: string }
 *     responses: { 201: { description: Submitted } }
 * /hiring/referrals/{id}:
 *   get: { tags: ['Hiring: Referrals'], summary: Get referral, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /hiring/referrals/{id}/review:
 *   post: { tags: ['Hiring: Referrals'], summary: Review referral (advance, reject, etc), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Reviewed } } }
 * /hiring/referrals/{id}/pay-bonus:
 *   post: { tags: ['Hiring: Referrals'], summary: Mark referral bonus paid, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Paid } } }
 *
 * /hiring/dashboard/overview:
 *   get: { tags: ['Hiring: Dashboard'], summary: Hiring pipeline KPIs, responses: { 200: { description: OK } } }
 */
module.exports = {};
