'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     SalaryStructure:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         name: { type: string }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         effective_from: { $ref: '#/components/schemas/IsoDate' }
 *         effective_to: { $ref: '#/components/schemas/IsoDate' }
 *         is_active: { type: boolean }
 *     SalaryRule:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         name: { type: string }
 *         category: { type: string, enum: [basic, allowance, gross, deduction, tax, contribution, net] }
 *         compute_type: { type: string, enum: [fixed, percent_of_basic, percent_of_category, percent_of_gross, formula] }
 *         fixed_amount: { $ref: '#/components/schemas/Money' }
 *         percent_value: { type: number, example: 40 }
 *         percent_of_category: { type: string, nullable: true }
 *         formula: { type: string, nullable: true }
 *         taxable: { type: boolean }
 *         is_active: { type: boolean }
 *     Contract:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         salary_structure_id: { $ref: '#/components/schemas/Uuid' }
 *         title: { type: string }
 *         start_date: { $ref: '#/components/schemas/IsoDate' }
 *         end_date: { $ref: '#/components/schemas/IsoDate' }
 *         wage_amount: { $ref: '#/components/schemas/Money' }
 *         wage_currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         wage_period: { type: string, enum: [hourly, daily, weekly, monthly, yearly] }
 *         status: { type: string, enum: [draft, active, expired, terminated] }
 *     Payrun:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         code: { type: string }
 *         period_start: { $ref: '#/components/schemas/IsoDate' }
 *         period_end: { $ref: '#/components/schemas/IsoDate' }
 *         payment_date: { $ref: '#/components/schemas/IsoDate' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         status: { type: string, enum: [draft, computed, validated, paid, cancelled] }
 *         warnings: { type: array, items: { type: object } }
 *         totals: { type: object }
 *     Payslip:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         payrun_id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         basic_amount: { $ref: '#/components/schemas/Money' }
 *         allowances_amount: { $ref: '#/components/schemas/Money' }
 *         gross_amount: { $ref: '#/components/schemas/Money' }
 *         deductions_amount: { $ref: '#/components/schemas/Money' }
 *         tax_amount: { $ref: '#/components/schemas/Money' }
 *         net_amount: { $ref: '#/components/schemas/Money' }
 *         advance_recovery_amount: { $ref: '#/components/schemas/Money' }
 *         status: { type: string, enum: [draft, computed, validated, paid, cancelled] }
 *         warnings: { type: array, items: { type: object } }
 *     AdvanceSalaryRequest:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         requested_amount: { $ref: '#/components/schemas/Money' }
 *         approved_amount: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         service_fee_percent: { type: number }
 *         service_fee_amount: { $ref: '#/components/schemas/Money' }
 *         disbursement_amount: { $ref: '#/components/schemas/Money' }
 *         outstanding_amount: { $ref: '#/components/schemas/Money' }
 *         repayment_mode: { type: string, enum: [salary_deduction, direct_transfer, emi] }
 *         emi_months: { type: integer, nullable: true }
 *         status: { type: string, enum: [requested, approved, disbursed, recovering, settled, rejected, cancelled] }
 *
 * /payroll/salary-structures:
 *   get:
 *     tags: ['Payroll: Salary Structures']
 *     summary: List salary structures
 *     parameters: [{ $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }]
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: ['Payroll: Salary Structures']
 *     summary: Create salary structure
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/SalaryStructure' } } } }
 *     responses: { 201: { description: Created }, 422: { $ref: '#/components/responses/ValidationError' } }
 * /payroll/salary-structures/{id}:
 *   get: { tags: ['Payroll: Salary Structures'], summary: Get salary structure with rules, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK }, 404: { $ref: '#/components/responses/NotFound' } } }
 *   patch: { tags: ['Payroll: Salary Structures'], summary: Update salary structure, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Payroll: Salary Structures'], summary: Delete salary structure, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /payroll/salary-structures/{id}/rules:
 *   put:
 *     tags: ['Payroll: Salary Structures']
 *     summary: Replace the rule set attached to a structure
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     salary_rule_id: { $ref: '#/components/schemas/Uuid' }
 *                     sequence: { type: integer, example: 100 }
 *                     override_amount: { $ref: '#/components/schemas/Money' }
 *                     override_percent: { type: number }
 *                     is_active: { type: boolean }
 *     responses: { 200: { description: Updated } }
 *
 * /payroll/salary-rules:
 *   get: { tags: ['Payroll: Salary Rules'], summary: List rules, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Payroll: Salary Rules']
 *     summary: Create rule
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/SalaryRule' } } } }
 *     responses: { 201: { description: Created }, 422: { $ref: '#/components/responses/ValidationError' } }
 * /payroll/salary-rules/{id}:
 *   get: { tags: ['Payroll: Salary Rules'], summary: Get rule, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Payroll: Salary Rules'], summary: Update rule, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Payroll: Salary Rules'], summary: Delete rule, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /payroll/contracts:
 *   get:
 *     tags: ['Payroll: Contracts']
 *     summary: List contracts
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: employee_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: active_on, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: OK } }
 *   post: { tags: ['Payroll: Contracts'], summary: Create contract, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Contract' } } } }, responses: { 201: { description: Created }, 409: { $ref: '#/components/responses/Conflict' } } }
 * /payroll/contracts/{id}:
 *   get: { tags: ['Payroll: Contracts'], summary: Get contract, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['Payroll: Contracts'], summary: Update contract, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Payroll: Contracts'], summary: Delete contract, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /payroll/contracts/{id}/activate:
 *   post: { tags: ['Payroll: Contracts'], summary: Activate contract and end previous active ones, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Activated } } }
 * /payroll/contracts/{id}/terminate:
 *   post: { tags: ['Payroll: Contracts'], summary: Terminate contract, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Terminated } } }
 *
 * /payroll/payruns:
 *   get: { tags: ['Payroll: Payruns'], summary: List payruns, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Payroll: Payruns']
 *     summary: Create payrun (step 2 of the wizard, after employee selection)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, period_start, period_end, employee_ids]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               salary_structure_id: { $ref: '#/components/schemas/Uuid' }
 *               period_start: { $ref: '#/components/schemas/IsoDate' }
 *               period_end: { $ref: '#/components/schemas/IsoDate' }
 *               payment_date: { $ref: '#/components/schemas/IsoDate' }
 *               currency: { $ref: '#/components/schemas/CurrencyCode' }
 *               employee_ids: { type: array, items: { type: string, format: uuid } }
 *     responses: { 201: { description: Created } }
 * /payroll/payruns/eligible-employees:
 *   get:
 *     tags: ['Payroll: Payruns']
 *     summary: List eligible employees for a period (step 1 of the wizard)
 *     parameters:
 *       - { name: period_start, in: query, required: true, schema: { type: string, format: date } }
 *       - { name: period_end, in: query, required: true, schema: { type: string, format: date } }
 *       - { name: department_ids, in: query, schema: { type: string, description: comma separated uuids } }
 *       - { name: employee_types, in: query, schema: { type: string, description: comma separated types } }
 *     responses: { 200: { description: OK } }
 * /payroll/payruns/{id}:
 *   get: { tags: ['Payroll: Payruns'], summary: Get payrun with payslips, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   delete: { tags: ['Payroll: Payruns'], summary: Delete draft or cancelled payrun, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted }, 409: { $ref: '#/components/responses/Conflict' } } }
 * /payroll/payruns/{id}/compute:
 *   post: { tags: ['Payroll: Payruns'], summary: Compute payslip lines and warnings for the payrun, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Computed } } }
 * /payroll/payruns/{id}/validate:
 *   post: { tags: ['Payroll: Payruns'], summary: Validate a computed payrun, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Validated }, 422: { $ref: '#/components/responses/ValidationError' } } }
 * /payroll/payruns/{id}/mark-paid:
 *   post: { tags: ['Payroll: Payruns'], summary: Release funds and mark payslips paid, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Paid } } }
 * /payroll/payruns/{id}/cancel:
 *   post: { tags: ['Payroll: Payruns'], summary: Cancel payrun, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 *
 * /payroll/payslips:
 *   get:
 *     tags: ['Payroll: Payslips']
 *     summary: List payslips
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: payrun_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: employee_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: status, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 * /payroll/payslips/{id}:
 *   get: { tags: ['Payroll: Payslips'], summary: Get payslip with lines, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /payroll/payslips/{id}/pdf:
 *   get:
 *     tags: ['Payroll: Payslips']
 *     summary: Download payslip as PDF
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     responses:
 *       200:
 *         description: PDF binary
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 * /payroll/payslips/{id}/mark-sent:
 *   post: { tags: ['Payroll: Payslips'], summary: Mark payslip as sent to the employee, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Marked sent } } }
 *
 * /payroll/salary-change-requests:
 *   get: { tags: ['Payroll: Salary Change Requests'], summary: List salary change requests, responses: { 200: { description: OK } } }
 * /payroll/salary-change-requests/suggest:
 *   post:
 *     tags: ['Payroll: Salary Change Requests']
 *     summary: HR suggests an increment or decrement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, change_type, reason]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               change_type: { type: string, enum: [increment, decrement] }
 *               amount: { $ref: '#/components/schemas/Money' }
 *               percent: { type: number }
 *               reason: { type: string }
 *               effective_from: { $ref: '#/components/schemas/IsoDate' }
 *     responses: { 201: { description: Suggested } }
 * /payroll/salary-change-requests/{id}:
 *   get: { tags: ['Payroll: Salary Change Requests'], summary: Get change request, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /payroll/salary-change-requests/{id}/payroll-decision:
 *   post:
 *     tags: ['Payroll: Salary Change Requests']
 *     summary: Payroll Manager decides the exact amount
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decided_amount]
 *             properties:
 *               decided_amount: { $ref: '#/components/schemas/Money' }
 *               note: { type: string }
 *     responses: { 200: { description: Decision recorded } }
 * /payroll/salary-change-requests/{id}/admin-approve:
 *   post: { tags: ['Payroll: Salary Change Requests'], summary: Admin approves the decided amount, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /payroll/salary-change-requests/{id}/reject:
 *   post: { tags: ['Payroll: Salary Change Requests'], summary: Reject the request, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rejected } } }
 * /payroll/salary-change-requests/{id}/apply:
 *   post: { tags: ['Payroll: Salary Change Requests'], summary: Apply approved change (ends old contract, creates new active contract), parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Applied } } }
 *
 * /payroll/advance-salary-requests:
 *   get: { tags: ['Payroll: Advance Salary'], summary: List advance salary requests, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['Payroll: Advance Salary']
 *     summary: Employee requests an advance salary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requested_amount, repayment_mode]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               requested_amount: { $ref: '#/components/schemas/Money' }
 *               repayment_mode: { type: string, enum: [salary_deduction, direct_transfer, emi] }
 *               emi_months: { type: integer }
 *               reason: { type: string }
 *     responses: { 201: { description: Created }, 422: { $ref: '#/components/responses/ValidationError' } }
 * /payroll/advance-salary-requests/{id}:
 *   get: { tags: ['Payroll: Advance Salary'], summary: Get advance request with repayments, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 * /payroll/advance-salary-requests/{id}/approve:
 *   post: { tags: ['Payroll: Advance Salary'], summary: Approve advance, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /payroll/advance-salary-requests/{id}/reject:
 *   post: { tags: ['Payroll: Advance Salary'], summary: Reject advance, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Rejected } } }
 * /payroll/advance-salary-requests/{id}/disburse:
 *   post: { tags: ['Payroll: Advance Salary'], summary: Mark advance as disbursed, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Disbursed } } }
 * /payroll/advance-salary-requests/{id}/repayments:
 *   post:
 *     tags: ['Payroll: Advance Salary']
 *     summary: Record a manual repayment
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mode, amount]
 *             properties:
 *               mode: { type: string, enum: [salary_deduction, direct_transfer, emi] }
 *               amount: { $ref: '#/components/schemas/Money' }
 *               currency: { $ref: '#/components/schemas/CurrencyCode' }
 *               payslip_id: { $ref: '#/components/schemas/Uuid' }
 *               external_reference: { type: string }
 *               note: { type: string }
 *     responses: { 201: { description: Recorded } }
 * /payroll/advance-salary-requests/{id}/convert-to-emi:
 *   post:
 *     tags: ['Payroll: Advance Salary']
 *     summary: Convert an active advance into EMIs
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emi_months]
 *             properties:
 *               emi_months: { type: integer }
 *     responses: { 200: { description: Converted } }
 *
 * /payroll/bonuses:
 *   get: { tags: ['Payroll: Bonuses'], summary: List bonuses, responses: { 200: { description: OK } } }
 *   post: { tags: ['Payroll: Bonuses'], summary: Create bonus, responses: { 201: { description: Created } } }
 * /payroll/bonuses/{id}/approve:
 *   post: { tags: ['Payroll: Bonuses'], summary: Approve bonus, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Approved } } }
 * /payroll/bonuses/{id}/cancel:
 *   post: { tags: ['Payroll: Bonuses'], summary: Cancel bonus, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Cancelled } } }
 * /payroll/bonuses/{id}:
 *   delete: { tags: ['Payroll: Bonuses'], summary: Delete bonus, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /payroll/employees/{employeeId}/payment-methods:
 *   get: { tags: ['Payroll: Payment Methods'], summary: List employee payment methods, parameters: [{ $ref: '#/components/parameters/UuidEmployeeId' }], responses: { 200: { description: OK } } }
 *   post: { tags: ['Payroll: Payment Methods'], summary: Add payment method, parameters: [{ $ref: '#/components/parameters/UuidEmployeeId' }], responses: { 201: { description: Created } } }
 * /payroll/employees/{employeeId}/payment-methods/{id}:
 *   patch: { tags: ['Payroll: Payment Methods'], summary: Update payment method, parameters: [{ $ref: '#/components/parameters/UuidEmployeeId' }, { $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['Payroll: Payment Methods'], summary: Delete payment method, parameters: [{ $ref: '#/components/parameters/UuidEmployeeId' }, { $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /payroll/dashboard/overview:
 *   get:
 *     tags: ['Payroll: Dashboard']
 *     summary: Payroll KPIs and salary cost by department
 *     parameters:
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *       - { name: department_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: employee_type, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 */
module.exports = {};
