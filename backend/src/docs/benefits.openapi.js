'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     BenefitProvider:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         category: { type: string, enum: [health_insurance, dental_insurance, vision_insurance, life_insurance, disability_insurance, maternity, paternity, legal_support, wellness, mental_health, transportation, meals, gift_voucher, shopping_discount, retirement, loan, learning, relocation, childcare, other] }
 *         contact_email: { type: string, format: email }
 *         contact_phone: { type: string, nullable: true }
 *         website: { type: string, format: uri, nullable: true }
 *         country_code: { type: string, nullable: true }
 *         is_active: { type: boolean }
 *     BenefitPlan:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         provider_id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         name: { type: string }
 *         category: { type: string }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         employer_cost_amount: { $ref: '#/components/schemas/Money' }
 *         employee_cost_amount: { $ref: '#/components/schemas/Money' }
 *         cost_frequency: { type: string, enum: [per_month, per_year, per_payroll, one_time] }
 *         coverage_amount: { $ref: '#/components/schemas/Money' }
 *         dependents_allowed: { type: boolean }
 *         max_dependents: { type: integer, nullable: true }
 *         taxable: { type: boolean }
 *         auto_enroll: { type: boolean }
 *         approval_required: { type: boolean }
 *         effective_from: { $ref: '#/components/schemas/IsoDate' }
 *         effective_to: { $ref: '#/components/schemas/IsoDate' }
 *         total_seats: { type: integer, nullable: true }
 *         seats_used: { type: integer }
 *         status: { type: string, enum: [draft, active, paused, archived] }
 *     BenefitEnrollment:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         benefit_plan_id: { $ref: '#/components/schemas/Uuid' }
 *         status: { type: string, enum: [pending_approval, active, waived, terminated, declined] }
 *         start_date: { $ref: '#/components/schemas/IsoDate' }
 *         end_date: { $ref: '#/components/schemas/IsoDate' }
 *         dependents_count: { type: integer }
 *         employee_monthly_cost: { $ref: '#/components/schemas/Money' }
 *         employer_monthly_cost: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *     BenefitClaim:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         claim_code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         benefit_enrollment_id: { $ref: '#/components/schemas/Uuid' }
 *         benefit_plan_id: { $ref: '#/components/schemas/Uuid' }
 *         subject: { type: string }
 *         description: { type: string, nullable: true }
 *         incurred_on: { $ref: '#/components/schemas/IsoDate' }
 *         claim_amount: { $ref: '#/components/schemas/Money' }
 *         approved_amount: { $ref: '#/components/schemas/Money' }
 *         reimbursed_amount: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         status: { type: string, enum: [submitted, under_review, approved, rejected, reimbursed, cancelled] }
 *     LoanProgram:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         name: { type: string }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         min_amount: { $ref: '#/components/schemas/Money' }
 *         max_amount: { $ref: '#/components/schemas/Money' }
 *         min_tenure_months: { type: integer }
 *         max_tenure_months: { type: integer }
 *         interest_mode: { type: string, enum: [zero, flat, reducing_balance] }
 *         interest_rate_percent: { type: number }
 *         processing_fee_percent: { type: number }
 *         requires_manager_approval: { type: boolean }
 *         requires_admin_approval: { type: boolean }
 *         salary_deduction_default: { type: boolean }
 *         is_active: { type: boolean }
 *     Loan:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         loan_program_id: { $ref: '#/components/schemas/Uuid' }
 *         requested_amount: { $ref: '#/components/schemas/Money' }
 *         approved_amount: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         tenure_months: { type: integer }
 *         interest_mode: { type: string, enum: [zero, flat, reducing_balance] }
 *         interest_rate_percent: { type: number }
 *         processing_fee_amount: { $ref: '#/components/schemas/Money' }
 *         monthly_installment: { $ref: '#/components/schemas/Money' }
 *         total_repayable: { $ref: '#/components/schemas/Money' }
 *         outstanding_amount: { $ref: '#/components/schemas/Money' }
 *         salary_deduction: { type: boolean }
 *         status: { type: string, enum: [draft, submitted, under_review, approved, rejected, disbursed, repaying, closed, cancelled] }
 *     GiftVoucher:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         partner_name: { type: string, nullable: true }
 *         category: { type: string, nullable: true }
 *         amount: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         status: { type: string, enum: [issued, delivered, redeemed, expired, cancelled] }
 *         valid_from: { $ref: '#/components/schemas/IsoDate' }
 *         valid_to: { $ref: '#/components/schemas/IsoDate' }
 *     DiscountPartner:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         category: { type: string, nullable: true }
 *         website: { type: string, format: uri, nullable: true }
 *         discount_percent: { type: number, nullable: true }
 *         discount_code: { type: string, nullable: true }
 *         valid_from: { $ref: '#/components/schemas/IsoDate' }
 *         valid_to: { $ref: '#/components/schemas/IsoDate' }
 *         is_active: { type: boolean }
 *
 * /benefits/providers:
 *   get: { tags: ['Benefits: Providers'], summary: List providers, responses: { 200: { description: OK } } }
 *   post: { tags: ['Benefits: Providers'], summary: Create provider, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/BenefitProvider' } } } }, responses: { 201: { description: Created } } }
 * /benefits/providers/{id}:
 *   get: { tags: ['Benefits: Providers'], summary: Get provider, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Benefits: Providers'], summary: Update provider, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Benefits: Providers'], summary: Delete provider, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /benefits/plans:
 *   get:
 *     tags: ['Benefits: Plans']
 *     summary: List benefit plans
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Benefits: Plans'], summary: Create plan, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/BenefitPlan' } } } }, responses: { 201: { description: Created } } }
 * /benefits/plans/{id}:
 *   get: { tags: ['Benefits: Plans'], summary: Get plan with enrollments, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Benefits: Plans'], summary: Update plan, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Benefits: Plans'], summary: Delete plan, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /benefits/enrollments:
 *   get: { tags: ['Benefits: Enrollments'], summary: List enrollments, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Benefits: Enrollments']
 *     summary: Enroll an employee into a plan (with optional dependents)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [benefit_plan_id, start_date]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               benefit_plan_id: { $ref: '#/components/schemas/Uuid' }
 *               start_date: { $ref: '#/components/schemas/IsoDate' }
 *               elected_amount: { $ref: '#/components/schemas/Money' }
 *               notes: { type: string }
 *               dependents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     first_name: { type: string }
 *                     last_name: { type: string }
 *                     relation: { type: string, enum: [spouse, child, parent, sibling, domestic_partner, other] }
 *                     date_of_birth: { $ref: '#/components/schemas/IsoDate' }
 *                     gender: { type: string }
 *                     national_id: { type: string }
 *     responses: { 201: { description: Enrolled } }
 * /benefits/enrollments/{id}:
 *   get: { tags: ['Benefits: Enrollments'], summary: Get enrollment with dependents, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /benefits/enrollments/{id}/approve:
 *   post: { tags: ['Benefits: Enrollments'], summary: Approve pending enrollment, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved }, 409: { $ref: '#/components/responses/Conflict' } } }
 * /benefits/enrollments/{id}/decline:
 *   post: { tags: ['Benefits: Enrollments'], summary: Decline pending enrollment, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Declined } } }
 * /benefits/enrollments/{id}/waive:
 *   post: { tags: ['Benefits: Enrollments'], summary: Employee waives pending enrollment, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Waived } } }
 * /benefits/enrollments/{id}/terminate:
 *   post: { tags: ['Benefits: Enrollments'], summary: Terminate an active enrollment, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Terminated } } }
 *
 * /benefits/claims:
 *   get: { tags: ['Benefits: Claims'], summary: List benefit claims, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Benefits: Claims']
 *     summary: Submit a claim against an active enrollment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [benefit_enrollment_id, subject, incurred_on, claim_amount]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               benefit_enrollment_id: { $ref: '#/components/schemas/Uuid' }
 *               subject: { type: string }
 *               description: { type: string }
 *               incurred_on: { $ref: '#/components/schemas/IsoDate' }
 *               claim_amount: { $ref: '#/components/schemas/Money' }
 *               currency: { $ref: '#/components/schemas/CurrencyCode' }
 *               documents: { type: array, items: { type: object } }
 *     responses: { 201: { description: Submitted } }
 * /benefits/claims/{id}:
 *   get: { tags: ['Benefits: Claims'], summary: Get claim, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /benefits/claims/{id}/start-review:
 *   post: { tags: ['Benefits: Claims'], summary: Move claim into review, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /benefits/claims/{id}/approve:
 *   post: { tags: ['Benefits: Claims'], summary: Approve claim, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /benefits/claims/{id}/reject:
 *   post: { tags: ['Benefits: Claims'], summary: Reject claim, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rejected } } }
 * /benefits/claims/{id}/reimburse:
 *   post: { tags: ['Benefits: Claims'], summary: Mark claim as reimbursed, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Reimbursed } } }
 * /benefits/claims/{id}/cancel:
 *   post: { tags: ['Benefits: Claims'], summary: Cancel claim, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 *
 * /benefits/loans/programs:
 *   get: { tags: ['Benefits: Loans'], summary: List loan programs, responses: { 200: { description: OK } } }
 *   post: { tags: ['Benefits: Loans'], summary: Create loan program, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/LoanProgram' } } } }, responses: { 201: { description: Created } } }
 * /benefits/loans/programs/{id}:
 *   patch: { tags: ['Benefits: Loans'], summary: Update loan program, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Benefits: Loans'], summary: Delete loan program, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /benefits/loans:
 *   get: { tags: ['Benefits: Loans'], summary: List loans, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Benefits: Loans']
 *     summary: Apply for a loan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [loan_program_id, requested_amount, tenure_months]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               loan_program_id: { $ref: '#/components/schemas/Uuid' }
 *               requested_amount: { $ref: '#/components/schemas/Money' }
 *               tenure_months: { type: integer }
 *               reason: { type: string }
 *     responses: { 201: { description: Created } }
 * /benefits/loans/{id}:
 *   get: { tags: ['Benefits: Loans'], summary: Get loan with repayments, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /benefits/loans/{id}/manager-review:
 *   post: { tags: ['Benefits: Loans'], summary: Manager reviews loan, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Reviewed } } }
 * /benefits/loans/{id}/admin-review:
 *   post: { tags: ['Benefits: Loans'], summary: Admin reviews loan, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Reviewed } } }
 * /benefits/loans/{id}/disburse:
 *   post: { tags: ['Benefits: Loans'], summary: Disburse approved loan, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Disbursed } } }
 * /benefits/loans/{id}/repayments:
 *   post: { tags: ['Benefits: Loans'], summary: Record a loan repayment, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 201: { description: Recorded } } }
 *
 * /benefits/vouchers:
 *   get: { tags: ['Benefits: Vouchers'], summary: List vouchers, responses: { 200: { description: OK } } }
 *   post: { tags: ['Benefits: Vouchers'], summary: Issue a voucher, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/GiftVoucher' } } } }, responses: { 201: { description: Issued } } }
 * /benefits/vouchers/{id}/deliver:
 *   post: { tags: ['Benefits: Vouchers'], summary: Mark voucher delivered, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Delivered } } }
 * /benefits/vouchers/{id}/redeem:
 *   post: { tags: ['Benefits: Vouchers'], summary: Redeem voucher, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Redeemed } } }
 * /benefits/vouchers/{id}/cancel:
 *   post: { tags: ['Benefits: Vouchers'], summary: Cancel voucher, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 *
 * /benefits/discount-partners:
 *   get: { tags: ['Benefits: Discount Partners'], summary: List discount partners, responses: { 200: { description: OK } } }
 *   post: { tags: ['Benefits: Discount Partners'], summary: Create partner, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/DiscountPartner' } } } }, responses: { 201: { description: Created } } }
 * /benefits/discount-partners/{id}:
 *   get: { tags: ['Benefits: Discount Partners'], summary: Get partner, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Benefits: Discount Partners'], summary: Update partner, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Benefits: Discount Partners'], summary: Delete partner, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /benefits/dashboard/overview:
 *   get:
 *     tags: ['Benefits: Dashboard']
 *     summary: Benefits KPI dashboard (enrollments, claims, loans, vouchers)
 *     parameters:
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: OK } }
 */
module.exports = {};
