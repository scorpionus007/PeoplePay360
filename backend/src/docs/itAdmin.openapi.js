'use strict';

/**
 * @openapi
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         asset_tag: { type: string }
 *         hostname: { type: string, nullable: true }
 *         serial_number: { type: string, nullable: true }
 *         category: { type: string, enum: [laptop, desktop, mobile, tablet, monitor, accessory, server] }
 *         manufacturer: { type: string, nullable: true }
 *         model: { type: string, nullable: true }
 *         os_family: { type: string, enum: [windows, macos, linux, ios, android, chromeos, other] }
 *         os_version: { type: string, nullable: true }
 *         cpu: { type: string, nullable: true }
 *         ram_gb: { type: integer, nullable: true }
 *         storage_gb: { type: integer, nullable: true }
 *         mac_address: { type: string, nullable: true }
 *         ownership: { type: string, enum: [owned, leased, byod] }
 *         status: { type: string, enum: [in_stock, assigned, in_repair, retired, lost, quarantined] }
 *         purchase_date: { $ref: '#/components/schemas/IsoDate' }
 *         purchase_cost: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         warranty_end: { $ref: '#/components/schemas/IsoDate' }
 *         lease_vendor: { type: string, nullable: true }
 *         lease_start: { $ref: '#/components/schemas/IsoDate' }
 *         lease_end: { $ref: '#/components/schemas/IsoDate' }
 *         lease_monthly_cost: { $ref: '#/components/schemas/Money' }
 *         agent_installed: { type: boolean }
 *         edr_installed: { type: boolean }
 *         assigned_employee_id: { $ref: '#/components/schemas/Uuid' }
 *     SoftwareCatalogItem:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         vendor: { type: string, nullable: true }
 *         category: { type: string, nullable: true }
 *         version: { type: string, nullable: true }
 *         license_type: { type: string, enum: [per_user, per_device, site, subscription, perpetual, free] }
 *         unit_cost: { $ref: '#/components/schemas/Money' }
 *         currency: { $ref: '#/components/schemas/CurrencyCode' }
 *         total_seats: { type: integer, nullable: true }
 *         seats_allocated: { type: integer }
 *         renewal_date: { $ref: '#/components/schemas/IsoDate' }
 *         is_managed: { type: boolean }
 *     BaselineControl:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         code: { type: string }
 *         name: { type: string }
 *         category: { type: string, enum: [patch, encryption, mfa, antivirus, edr, firewall, backup, password_policy, access_control, os_config] }
 *         severity: { type: string, enum: [info, low, medium, high, critical] }
 *         is_mandatory: { type: boolean }
 *         is_active: { type: boolean }
 *     DeviceBaselineCheck:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         device_id: { $ref: '#/components/schemas/Uuid' }
 *         baseline_control_id: { $ref: '#/components/schemas/Uuid' }
 *         status: { type: string, enum: [pass, fail, warn, skip, unknown] }
 *         checked_at: { $ref: '#/components/schemas/Iso8601' }
 *         evidence: { type: object }
 *         remediation_note: { type: string, nullable: true }
 *         source: { type: string, enum: [agent, manual, edr, external] }
 *     EdrIntegration:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         vendor: { type: string, enum: [crowdstrike, sentinelone, microsoft_defender, sophos, carbon_black, elastic, custom] }
 *         display_name: { type: string }
 *         api_base_url: { type: string, format: uri, nullable: true }
 *         status: { type: string, enum: [connected, degraded, disconnected, error] }
 *         last_synced_at: { $ref: '#/components/schemas/Iso8601' }
 *         is_active: { type: boolean }
 *     EdrEvent:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         edr_integration_id: { $ref: '#/components/schemas/Uuid' }
 *         device_id: { $ref: '#/components/schemas/Uuid' }
 *         event_type: { type: string }
 *         severity: { type: string, enum: [info, low, medium, high, critical] }
 *         occurred_at: { $ref: '#/components/schemas/Iso8601' }
 *         title: { type: string, nullable: true }
 *         summary: { type: string, nullable: true }
 *         status: { type: string, enum: [new, triaged, in_progress, resolved, false_positive] }
 *     OnboardingKit:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         device_category: { type: string, enum: [laptop, desktop, mobile, tablet, monitor, accessory, server] }
 *         preferred_os_family: { type: string, enum: [windows, macos, linux, ios, android, chromeos, other] }
 *         target_employee_types: { type: array, items: { type: string } }
 *         software_ids: { type: array, items: { type: string, format: uuid } }
 *         baseline_control_ids: { type: array, items: { type: string, format: uuid } }
 *         specs: { type: object }
 *         is_default: { type: boolean }
 *         is_active: { type: boolean }
 *     OnboardingProvision:
 *       type: object
 *       properties:
 *         id: { $ref: '#/components/schemas/Uuid' }
 *         employee_id: { $ref: '#/components/schemas/Uuid' }
 *         onboarding_kit_id: { $ref: '#/components/schemas/Uuid' }
 *         device_id: { $ref: '#/components/schemas/Uuid' }
 *         status: { type: string, enum: [requested, preparing, dispatched, delivered, activated, cancelled] }
 *         shipping_address: { type: string, nullable: true }
 *         shipping_reference: { type: string, nullable: true }
 *         estimated_ready_date: { $ref: '#/components/schemas/IsoDate' }
 *         dispatched_at: { $ref: '#/components/schemas/Iso8601' }
 *         delivered_at: { $ref: '#/components/schemas/Iso8601' }
 *         activated_at: { $ref: '#/components/schemas/Iso8601' }
 *
 * /it/devices:
 *   get:
 *     tags: ['IT: Devices']
 *     summary: List devices
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: ownership, in: query, schema: { type: string } }
 *       - { name: os_family, in: query, schema: { type: string } }
 *       - { name: assigned_employee_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: ['IT: Devices']
 *     summary: Create a device record
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Device' } } } }
 *     responses: { 201: { description: Created }, 422: { $ref: '#/components/responses/ValidationError' } }
 * /it/devices/{id}:
 *   get: { tags: ['IT: Devices'], summary: Get device with assignments, software, baseline checks, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK }, 404: { $ref: '#/components/responses/NotFound' } } }
 *   patch: { tags: ['IT: Devices'], summary: Update device, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['IT: Devices'], summary: Delete device, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /it/devices/{id}/assign:
 *   post:
 *     tags: ['IT: Devices']
 *     summary: Assign a device to an employee
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               checkout_condition: { type: string }
 *               note: { type: string }
 *     responses: { 200: { description: Assigned }, 409: { $ref: '#/components/responses/Conflict' } }
 * /it/devices/{id}/unassign:
 *   post: { tags: ['IT: Devices'], summary: Return a device from an employee to stock, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Unassigned } } }
 *
 * /it/software:
 *   get: { tags: ['IT: Software'], summary: List software catalog, responses: { 200: { description: OK } } }
 *   post: { tags: ['IT: Software'], summary: Create software item, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/SoftwareCatalogItem' } } } }, responses: { 201: { description: Created } } }
 * /it/software/{id}:
 *   get: { tags: ['IT: Software'], summary: Get software item with installs, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['IT: Software'], summary: Update software item, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['IT: Software'], summary: Delete software item, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 *
 * /it/devices/{deviceId}/software:
 *   get: { tags: ['IT: Software'], summary: List software installed on a device, parameters: [{ name: deviceId, in: path, required: true, schema: { type: string, format: uuid } }], responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['IT: Software']
 *     summary: Assign or install software on a device (allocates a seat)
 *     parameters: [{ name: deviceId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [software_catalog_item_id]
 *             properties:
 *               software_catalog_item_id: { $ref: '#/components/schemas/Uuid' }
 *               version: { type: string }
 *               status: { type: string, enum: [installed, pending, uninstalled, failed] }
 *               license_reference: { type: string }
 *     responses: { 201: { description: Assigned }, 409: { $ref: '#/components/responses/Conflict' } }
 * /it/devices/{deviceId}/software/{id}:
 *   delete: { tags: ['IT: Software'], summary: Uninstall software from a device (releases a seat), parameters: [{ name: deviceId, in: path, required: true, schema: { type: string, format: uuid } }, { $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Removed } } }
 *
 * /it/baseline/controls:
 *   get: { tags: ['IT: Baseline'], summary: List baseline controls, responses: { 200: { description: OK } } }
 *   post: { tags: ['IT: Baseline'], summary: Create baseline control, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/BaselineControl' } } } }, responses: { 201: { description: Created } } }
 * /it/baseline/controls/{id}:
 *   get: { tags: ['IT: Baseline'], summary: Get baseline control, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['IT: Baseline'], summary: Update control, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['IT: Baseline'], summary: Delete control, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /it/devices/{deviceId}/baseline-checks:
 *   post:
 *     tags: ['IT: Baseline']
 *     summary: Report a baseline check result for a device (upsert)
 *     parameters: [{ name: deviceId, in: path, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [baseline_control_id, status]
 *             properties:
 *               baseline_control_id: { $ref: '#/components/schemas/Uuid' }
 *               status: { type: string, enum: [pass, fail, warn, skip, unknown] }
 *               evidence: { type: object }
 *               remediation_note: { type: string }
 *               source: { type: string, enum: [agent, manual, edr, external] }
 *     responses: { 200: { description: Recorded } }
 * /it/devices/{deviceId}/baseline-posture:
 *   get: { tags: ['IT: Baseline'], summary: Baseline posture for a device, parameters: [{ name: deviceId, in: path, required: true, schema: { type: string, format: uuid } }], responses: { 200: { description: OK } } }
 * /it/baseline/posture:
 *   get: { tags: ['IT: Baseline'], summary: Organization wide baseline posture, responses: { 200: { description: OK } } }
 *
 * /it/edr/integrations:
 *   get: { tags: ['IT: EDR'], summary: List EDR integrations (credentials_ref never returned), responses: { 200: { description: OK } } }
 *   post: { tags: ['IT: EDR'], summary: Register an EDR integration, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/EdrIntegration' } } } }, responses: { 201: { description: Created } } }
 * /it/edr/integrations/{id}:
 *   get: { tags: ['IT: EDR'], summary: Get integration, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['IT: EDR'], summary: Update integration, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['IT: EDR'], summary: Delete integration, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /it/edr/integrations/{id}/events:
 *   post:
 *     tags: ['IT: EDR']
 *     summary: Ingest a normalized EDR event
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event_type]
 *             properties:
 *               device_id: { $ref: '#/components/schemas/Uuid' }
 *               external_event_id: { type: string }
 *               event_type: { type: string }
 *               severity: { type: string, enum: [info, low, medium, high, critical] }
 *               occurred_at: { $ref: '#/components/schemas/Iso8601' }
 *               title: { type: string }
 *               summary: { type: string }
 *               raw_payload: { type: object }
 *     responses: { 201: { description: Ingested } }
 * /it/edr/events:
 *   get:
 *     tags: ['IT: EDR']
 *     summary: List EDR events
 *     parameters:
 *       - { $ref: '#/components/parameters/Page' }
 *       - { $ref: '#/components/parameters/Limit' }
 *       - { name: severity, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: device_id, in: query, schema: { type: string, format: uuid } }
 *       - { name: from, in: query, schema: { type: string, format: date-time } }
 *       - { name: to, in: query, schema: { type: string, format: date-time } }
 *     responses: { 200: { description: OK } }
 * /it/edr/integrations/{id}/events/{eventId}/status:
 *   patch:
 *     tags: ['IT: EDR']
 *     summary: Update an EDR event's status and assignment
 *     parameters:
 *       - { $ref: '#/components/parameters/UuidId' }
 *       - { name: eventId, in: path, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [new, triaged, in_progress, resolved, false_positive] }
 *               assigned_to: { $ref: '#/components/schemas/Uuid' }
 *     responses: { 200: { description: Updated } }
 *
 * /it/onboarding/kits:
 *   get: { tags: ['IT: Onboarding'], summary: List onboarding kits, responses: { 200: { description: OK } } }
 *   post: { tags: ['IT: Onboarding'], summary: Create kit, requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/OnboardingKit' } } } }, responses: { 201: { description: Created } } }
 * /it/onboarding/kits/{id}:
 *   get: { tags: ['IT: Onboarding'], summary: Get kit, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: OK } } }
 *   patch: { tags: ['IT: Onboarding'], summary: Update kit, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 200: { description: Updated } } }
 *   delete: { tags: ['IT: Onboarding'], summary: Delete kit, parameters: [{ $ref: '#/components/parameters/UuidId' }], responses: { 204: { description: Deleted } } }
 * /it/onboarding/provisions:
 *   get: { tags: ['IT: Onboarding'], summary: List provisions, responses: { 200: { description: OK } } }
 *   post:
 *     tags: ['IT: Onboarding']
 *     summary: Start an onboarding provision
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, onboarding_kit_id]
 *             properties:
 *               employee_id: { $ref: '#/components/schemas/Uuid' }
 *               onboarding_kit_id: { $ref: '#/components/schemas/Uuid' }
 *               device_id: { $ref: '#/components/schemas/Uuid' }
 *               shipping_address: { type: string }
 *               estimated_ready_date: { $ref: '#/components/schemas/IsoDate' }
 *               note: { type: string }
 *     responses: { 201: { description: Created } }
 * /it/onboarding/provisions/{id}/status:
 *   patch:
 *     tags: ['IT: Onboarding']
 *     summary: Advance provision status (auto assigns the device on activated)
 *     parameters: [{ $ref: '#/components/parameters/UuidId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [requested, preparing, dispatched, delivered, activated, cancelled] }
 *               device_id: { $ref: '#/components/schemas/Uuid' }
 *     responses: { 200: { description: Updated } }
 *
 * /it/dashboard/overview:
 *   get: { tags: ['IT: Dashboard'], summary: IT KPI dashboard (fleet counts, posture, EDR alerts), responses: { 200: { description: OK } } }
 */
module.exports = {};
