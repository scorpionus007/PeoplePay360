'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     LocationStandard:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         country_code: { type: string, example: US }
 *         region_code: { type: string, nullable: true }
 *         city: { type: string, nullable: true }
 *         display_name: { type: string }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         timezone: { type: string }
 *         standard_weekly_hours: { type: number }
 *         minimum_pto_days: { type: integer }
 *         minimum_sick_days: { type: integer }
 *         overtime_multiplier: { type: number }
 *         minimum_wage_amount: { $ref: '#/components/schemas/Money' }
 *         minimum_wage_period: { type: string, enum: [hourly, daily, weekly, monthly, yearly] }
 *         notice_period_days: { type: integer, nullable: true }
 *         social_security_percent: { type: number, nullable: true }
 *         requires_work_visa_for_foreign_workers: { type: boolean }
 *         permits_remote_work: { type: boolean }
 *         is_active: { type: boolean }
 *     MobilityPartner:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         category: { type: string, enum: [immigration_lawyer, relocation_agency, tax_consultant, housing, insurance, language_training, travel_agency, other] }
 *         country_code: { type: string, nullable: true }
 *         city: { type: string, nullable: true }
 *         contact_email: { type: string, format: email, nullable: true }
 *         website: { type: string, format: uri, nullable: true }
 *         contract_end_date: { $ref: '#/components/schemas/IsoDate' }
 *         rating: { type: number, nullable: true }
 *         is_active: { type: boolean }
 *     VisaSponsorship:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         case_code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         mobility_partner_id: { $ref: '#/components/schemas/Uuid' }
 *         visa_type: { type: string, enum: [work_visa, business_visa, dependent_visa, permanent_residency, student_visa, transit, digital_nomad, other] }
 *         country_code: { type: string }
 *         visa_category: { type: string, nullable: true }
 *         status: { type: string, enum: [initiated, documents_collecting, under_internal_review, filed, rfe_pending, approved, denied, expired, renewed, cancelled] }
 *         valid_from: { $ref: '#/components/schemas/IsoDate' }
 *         valid_to: { $ref: '#/components/schemas/IsoDate' }
 *         total_cost_amount: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         priority: { type: string, enum: [low, normal, high, urgent] }
 *     VisaDocument:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         visa_sponsorship_id: { $ref: '#/components/schemas/Uuid' }
 *         document_type: { type: string }
 *         title: { type: string }
 *         file_url: { type: string, format: uri, nullable: true }
 *         status: { type: string, enum: [pending, uploaded, verified, rejected] }
 *         expires_at: { $ref: '#/components/schemas/IsoDate' }
 *     RelocationCase:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         case_code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         from_country_code: { type: string }
 *         to_country_code: { type: string }
 *         reason: { type: string, enum: [new_role, transfer, promotion, return_home, other] }
 *         status: { type: string, enum: [requested, approved, in_progress, completed, cancelled] }
 *         budget_amount: { $ref: '#/components/schemas/Money' }
 *         budget_currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         spent_amount: { $ref: '#/components/schemas/Money' }
 *         budget_status: { type: string, enum: [draft, approved, exhausted, closed] }
 *         target_move_date: { $ref: '#/components/schemas/IsoDate' }
 *         actual_move_date: { $ref: '#/components/schemas/IsoDate' }
 *         dependents_count: { type: integer }
 *     RelocationExpense:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         relocation_case_id: { $ref: '#/components/schemas/Uuid' }
 *         category: { type: string, enum: [flights, shipping, housing, temporary_stay, visa_fees, legal, transport, per_diem, other] }
 *         description: { type: string }
 *         amount: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         incurred_on: { $ref: '#/components/schemas/IsoDate' }
 *         status: { type: string, enum: [pending, approved, rejected, reimbursed] }
 *     ImmigrationCase:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         case_code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         case_type: { type: string, enum: [work_visa, permanent_residency, family_sponsorship, citizenship, renewal, appeal] }
 *         country_code: { type: string }
 *         status: { type: string, enum: [open, in_progress, on_hold, escalated, resolved, cancelled] }
 *         priority: { type: string, enum: [low, normal, high, urgent] }
 *         dependents_count: { type: integer }
 *         opened_at: { $ref: '#/components/schemas/Iso8601' }
 *         next_action_due: { $ref: '#/components/schemas/IsoDate' }
 *     TravelRequest:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         purpose: { type: string }
 *         trip_type: { type: string, enum: [business, client_visit, training, conference, onboarding, relocation, other] }
 *         from_country_code: { type: string, nullable: true }
 *         to_country_code: { type: string }
 *         depart_date: { $ref: '#/components/schemas/IsoDate' }
 *         return_date: { $ref: '#/components/schemas/IsoDate' }
 *         estimated_cost: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         requires_visa: { type: boolean }
 *         status: { type: string, enum: [draft, submitted, approved, rejected, booked, in_progress, completed, cancelled] }
 *         booking_reference: { type: string, nullable: true }
 *
 * /mobility/location-standards:
 *   get: { tags: ['Mobility: Location Standards'], summary: List location standards, responses: { 200: { description: OK } } }
 *   post: { tags: ['Mobility: Location Standards'], summary: Create location standard, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/LocationStandard' } } } }, responses: { 201: { description: Created } } }
 * /mobility/location-standards/{id}:
 *   get: { tags: ['Mobility: Location Standards'], summary: Get standard, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Mobility: Location Standards'], summary: Update standard, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Mobility: Location Standards'], summary: Delete standard, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /mobility/partners:
 *   get: { tags: ['Mobility: Partners'], summary: List partners, responses: { 200: { description: OK } } }
 *   post: { tags: ['Mobility: Partners'], summary: Create partner, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/MobilityPartner' } } } }, responses: { 201: { description: Created } } }
 * /mobility/partners/{id}:
 *   get: { tags: ['Mobility: Partners'], summary: Get partner, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Mobility: Partners'], summary: Update partner, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Mobility: Partners'], summary: Delete partner, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /mobility/visas:
 *   get:
 *     tags: ['Mobility: Visa Sponsorships']
 *     summary: List visa cases
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: employee_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: country_code, in: query, schema: { type: string, minLength: 2, maxLength: 2 } }
 *       - { name: visa_type, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Mobility: Visa Sponsorships'], summary: Initiate visa case, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/VisaSponsorship' } } } }, responses: { 201: { description: Initiated } } }
 * /mobility/visas/{id}:
 *   get: { tags: ['Mobility: Visa Sponsorships'], summary: Get visa case with documents, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   delete: { tags: ['Mobility: Visa Sponsorships'], summary: Delete visa case, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /mobility/visas/{id}/transition:
 *   post:
 *     tags: ['Mobility: Visa Sponsorships']
 *     summary: Transition visa status (documents, filed, approved, denied, expired, cancelled)
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [initiated, documents_collecting, under_internal_review, filed, rfe_pending, approved, denied, expired, renewed, cancelled] }
 *               note: { type: string }
 *     responses: { 200: { description: Transitioned } }
 * /mobility/visas/{id}/renew:
 *   post: { tags: ['Mobility: Visa Sponsorships'], summary: Renew an approved visa (creates a new case, marks old as renewed), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 201: { description: Renewed } } }
 * /mobility/visas/{id}/documents:
 *   post:
 *     tags: ['Mobility: Visa Sponsorships']
 *     summary: Add a document to a visa case
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/VisaDocument' } } } }
 *     responses: { 201: { description: Added } }
 *
 * /mobility/relocations:
 *   get: { tags: ['Mobility: Relocations'], summary: List relocation cases, responses: { 200: { description: OK } } }
 *   post: { tags: ['Mobility: Relocations'], summary: Request a relocation, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/RelocationCase' } } } }, responses: { 201: { description: Requested } } }
 * /mobility/relocations/{id}:
 *   get: { tags: ['Mobility: Relocations'], summary: Get relocation case with expenses, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /mobility/relocations/{id}/approve:
 *   post:
 *     tags: ['Mobility: Relocations']
 *     summary: Approve relocation with optional budget
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budget_amount: { $ref: '#/components/schemas/Money' }
 *               budget_currency: { $ref: '#/components/schemas/CurrencyCode' }
 *               note: { type: string }
 *     responses: { 200: { description: Approved } }
 * /mobility/relocations/{id}/transition:
 *   post: { tags: ['Mobility: Relocations'], summary: Transition status (in_progress, completed, cancelled), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Transitioned } } }
 * /mobility/relocations/{id}/expenses:
 *   post: { tags: ['Mobility: Relocations'], summary: Record relocation expense (auto updates spent_amount and budget_status), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 201: { description: Recorded } } }
 * /mobility/relocations/{id}/expenses/{expenseId}/review:
 *   patch:
 *     tags: ['Mobility: Relocations']
 *     summary: Review a relocation expense (approve, reject, reimburse)
 *     parameters:
 *       - { $ref: '#/components/parameters/UuidId' }
 *       - { name: expenseId, in: path, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [approved, rejected, reimbursed] }
 *               note: { type: string }
 *     responses: { 200: { description: Reviewed } }
 *
 * /mobility/immigration-cases:
 *   get: { tags: ['Mobility: Immigration Cases'], summary: List cases, responses: { 200: { description: OK } } }
 *   post: { tags: ['Mobility: Immigration Cases'], summary: Open case, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ImmigrationCase' } } } }, responses: { 201: { description: Opened } } }
 * /mobility/immigration-cases/{id}:
 *   get: { tags: ['Mobility: Immigration Cases'], summary: Get case, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Mobility: Immigration Cases'], summary: Update case, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Mobility: Immigration Cases'], summary: Delete case, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /mobility/immigration-cases/{id}/resolve:
 *   post: { tags: ['Mobility: Immigration Cases'], summary: Resolve case, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Resolved } } }
 *
 * /mobility/travel:
 *   get:
 *     tags: ['Mobility: Travel Requests']
 *     summary: List travel requests
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: employee_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Mobility: Travel Requests'], summary: Submit travel request, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/TravelRequest' } } } }, responses: { 201: { description: Submitted } } }
 * /mobility/travel/{id}:
 *   get: { tags: ['Mobility: Travel Requests'], summary: Get travel request, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /mobility/travel/{id}/approve:
 *   post: { tags: ['Mobility: Travel Requests'], summary: Approve, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /mobility/travel/{id}/reject:
 *   post: { tags: ['Mobility: Travel Requests'], summary: Reject, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rejected } } }
 * /mobility/travel/{id}/book:
 *   post:
 *     tags: ['Mobility: Travel Requests']
 *     summary: Mark booked with reference
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_reference]
 *             properties:
 *               booking_reference: { type: string }
 *     responses: { 200: { description: Booked } }
 * /mobility/travel/{id}/complete:
 *   post: { tags: ['Mobility: Travel Requests'], summary: Mark completed, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Completed } } }
 * /mobility/travel/{id}/cancel:
 *   post: { tags: ['Mobility: Travel Requests'], summary: Cancel, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 *
 * /mobility/dashboard/overview:
 *   get: { tags: ['Mobility: Dashboard'], summary: Mobility KPI dashboard (active visas, expiring, relocations, immigration, travel), responses: { 200: { description: OK } } }
 */
module.exports = {};
