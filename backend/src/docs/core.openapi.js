'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         legal_name: { type: string, nullable: true }
 *         registration_number: { type: string, nullable: true }
 *         domain: { type: string, nullable: true }
 *         country_code: { type: string, nullable: true }
 *         timezone: { type: string, example: UTC }
 *         base_currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         is_active: { type: boolean }
 *         metadata: { type: object }
 *     Department:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         organization_id: { $ref: '#/components/schemas/Uuid' }
 *         parent_id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         code: { type: string, nullable: true }
 *         description: { type: string, nullable: true }
 *         is_active: { type: boolean }
 *     Employee:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         organization_id: { $ref: '#/components/schemas/Uuid' }
 *         department_id: { $ref: '#/components/schemas/Uuid' }
 *         manager_id: { $ref: '#/components/schemas/Uuid' }
 *         working_schedule_id: { $ref: '#/components/schemas/Uuid' }
 *         employee_number: { type: string }
 *         first_name: { type: string }
 *         last_name: { type: string }
 *         email_work: { type: string, format: email }
 *         phone: { type: string, nullable: true }
 *         job_title: { type: string, nullable: true }
 *         employment_type: { type: string, enum: [full_time, part_time, contract, intern, freelancer, auditor] }
 *         employment_status: { type: string, enum: [active, on_leave, suspended, terminated, onboarding] }
 *         hire_date: { $ref: '#/components/schemas/IsoDate' }
 *         base_currency: { $ref: '#/components/schemas/CurrencyCode' }
 *
 * /organizations/me:
 *   get:
 *     tags: ['Organizations']
 *     summary: Get the current caller's organization
 *     responses:
 *       200:
 *         description: Organization payload
 *         content: { application/json: { schema: { allOf: [ { $ref: '#/components/schemas/SuccessEnvelope' }, { properties: { data: { $ref: '#/components/schemas/Organization' } } } ] } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   patch:
 *     tags: ['Organizations']
 *     summary: Update the current organization (admin only)
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/Organization' } } }
 *     responses:
 *       200: { description: Updated, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *
 * /departments:
 *   get:
 *     tags: ['Departments']
 *     summary: List departments
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   post:
 *     tags: ['Departments']
 *     summary: Create a department
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/Department' } } }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } }
 *       422: { $ref: '#/components/responses/ValidationError' }
 *
 * /departments/{id}:
 *   get:
 *     tags: ['Departments']
 *     summary: Get a department
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   patch:
 *     tags: ['Departments']
 *     summary: Update a department
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Department' } } } }
 *     responses:
 *       200: { description: Updated }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: ['Departments']
 *     summary: Delete a department
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /employees:
 *   get:
 *     tags: ['Employees']
 *     summary: List employees
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: department_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: employment_status, in: query, schema: { type: string } }
 *       - { name: employment_type, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 *   post:
 *     tags: ['Employees']
 *     summary: Create employee
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Employee' } } } }
 *     responses:
 *       201: { description: Created }
 *       422: { $ref: '#/components/responses/ValidationError' }
 *
 * /employees/{id}:
 *   get:
 *     tags: ['Employees']
 *     summary: Get employee with department and manager
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   patch:
 *     tags: ['Employees']
 *     summary: Update employee
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Employee' } } } }
 *     responses:
 *       200: { description: Updated }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: ['Employees']
 *     summary: Delete employee
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
module.exports = {};
