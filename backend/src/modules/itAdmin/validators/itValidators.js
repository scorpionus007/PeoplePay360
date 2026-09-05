'use strict';

const Joi = require('joi');
const {
  DEVICE_STATUS,
  DEVICE_OWNERSHIP,
  DEVICE_CATEGORY,
  OS_FAMILY,
  BASELINE_STATUS,
  BASELINE_CATEGORY,
  EDR_VENDOR,
  EDR_EVENT_SEVERITY,
  ONBOARDING_PROVISION_STATUS,
  SOFTWARE_LICENSE_TYPE,
  DEVICE_SOFTWARE_STATUS,
} = require('../../../config/constants');

const uuid = Joi.string().uuid();
const currency = Joi.string().length(3).uppercase();
const money = Joi.number().min(0).precision(4);

exports.idParam = Joi.object({ id: uuid.required() });
exports.deviceIdParam = Joi.object({ deviceId: uuid.required() });
exports.deviceAndIdParams = Joi.object({ deviceId: uuid.required(), id: uuid.required() });
exports.integrationAndEventParams = Joi.object({ id: uuid.required(), eventId: uuid.required() });

exports.createDevice = Joi.object({
  assigned_employee_id: uuid.allow(null),
  asset_tag: Joi.string().max(80).required(),
  hostname: Joi.string().max(150).allow(null, ''),
  serial_number: Joi.string().max(120).allow(null, ''),
  category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).default('laptop'),
  manufacturer: Joi.string().max(120).allow(null, ''),
  model: Joi.string().max(150).allow(null, ''),
  os_family: Joi.string().valid(...Object.values(OS_FAMILY)).default('windows'),
  os_version: Joi.string().max(80).allow(null, ''),
  cpu: Joi.string().max(120).allow(null, ''),
  ram_gb: Joi.number().integer().min(0).max(4096).allow(null),
  storage_gb: Joi.number().integer().min(0).max(1048576).allow(null),
  mac_address: Joi.string().max(30).allow(null, ''),
  ip_address: Joi.string().max(64).allow(null, ''),
  ownership: Joi.string().valid(...Object.values(DEVICE_OWNERSHIP)).default('owned'),
  status: Joi.string().valid(...Object.values(DEVICE_STATUS)).default('in_stock'),
  purchase_date: Joi.date().iso().allow(null),
  purchase_cost: money.allow(null),
  currency: currency.default('USD'),
  warranty_end: Joi.date().iso().allow(null),
  lease_vendor: Joi.string().max(150).allow(null, ''),
  lease_start: Joi.date().iso().allow(null),
  lease_end: Joi.date().iso().allow(null),
  lease_monthly_cost: money.allow(null),
  location: Joi.string().max(150).allow(null, ''),
  agent_installed: Joi.boolean().default(false),
  edr_installed: Joi.boolean().default(false),
  notes: Joi.string().max(1000).allow(null, ''),
  metadata: Joi.object().default({}),
});

// On update, assignment is managed through the assign/unassign endpoints, so
// status and assigned_employee_id cannot be set directly here.
exports.updateDevice = exports.createDevice
  .fork(['asset_tag'], (s) => s.optional())
  .fork(['status', 'assigned_employee_id'], (s) => s.forbidden())
  .keys({});

exports.assignDevice = Joi.object({
  employee_id: uuid.required(),
  checkout_condition: Joi.string().max(200).allow(null, ''),
  note: Joi.string().max(500).allow(null, ''),
});

exports.unassignDevice = Joi.object({
  return_condition: Joi.string().max(200).allow(null, ''),
  note: Joi.string().max(500).allow(null, ''),
});

exports.createSoftwareItem = Joi.object({
  name: Joi.string().max(200).required(),
  vendor: Joi.string().max(150).allow(null, ''),
  category: Joi.string().max(80).allow(null, ''),
  version: Joi.string().max(80).allow(null, ''),
  license_type: Joi.string().valid(...Object.values(SOFTWARE_LICENSE_TYPE)).default('subscription'),
  unit_cost: money.allow(null),
  currency: currency.default('USD'),
  total_seats: Joi.number().integer().min(0).max(1000000).allow(null),
  renewal_date: Joi.date().iso().allow(null),
  is_managed: Joi.boolean().default(true),
  description: Joi.string().max(1000).allow(null, ''),
});

exports.updateSoftwareItem = exports.createSoftwareItem
  .fork(['name'], (s) => s.optional())
  .keys({});

exports.assignSoftware = Joi.object({
  software_catalog_item_id: uuid.required(),
  version: Joi.string().max(80).allow(null, ''),
  status: Joi.string().valid(...Object.values(DEVICE_SOFTWARE_STATUS)).default('installed'),
  license_reference: Joi.string().max(200).allow(null, ''),
});

exports.createBaselineControl = Joi.object({
  code: Joi.string().max(80).required(),
  name: Joi.string().max(200).required(),
  category: Joi.string().valid(...Object.values(BASELINE_CATEGORY)).required(),
  description: Joi.string().max(1000).allow(null, ''),
  severity: Joi.string().valid('info', 'low', 'medium', 'high', 'critical').default('medium'),
  is_mandatory: Joi.boolean().default(true),
  is_active: Joi.boolean().default(true),
  remediation_guidance: Joi.string().max(2000).allow(null, ''),
});

exports.updateBaselineControl = exports.createBaselineControl
  .fork(['code', 'name', 'category'], (s) => s.optional())
  .keys({});

exports.reportBaselineCheck = Joi.object({
  baseline_control_id: uuid.required(),
  status: Joi.string().valid(...Object.values(BASELINE_STATUS)).required(),
  evidence: Joi.object().default({}),
  remediation_note: Joi.string().max(1000).allow(null, ''),
  source: Joi.string().valid('agent', 'manual', 'edr', 'external').default('agent'),
});

exports.createEdrIntegration = Joi.object({
  vendor: Joi.string().valid(...Object.values(EDR_VENDOR)).required(),
  display_name: Joi.string().max(200).required(),
  api_base_url: Joi.string().uri().max(500).allow(null, ''),
  credentials_ref: Joi.string().max(255).allow(null, ''),
  status: Joi.string().valid('connected', 'degraded', 'disconnected', 'error').default('disconnected'),
  settings: Joi.object().default({}),
  is_active: Joi.boolean().default(true),
});

exports.updateEdrIntegration = exports.createEdrIntegration
  .fork(['vendor', 'display_name'], (s) => s.optional())
  .keys({});

exports.ingestEdrEvent = Joi.object({
  device_id: uuid.allow(null),
  external_event_id: Joi.string().max(200).allow(null, ''),
  event_type: Joi.string().max(120).required(),
  severity: Joi.string().valid(...Object.values(EDR_EVENT_SEVERITY)).default('info'),
  occurred_at: Joi.date().iso().allow(null),
  title: Joi.string().max(300).allow(null, ''),
  summary: Joi.string().max(2000).allow(null, ''),
  raw_payload: Joi.object().default({}),
});

exports.updateEdrEventStatus = Joi.object({
  status: Joi.string().valid('new', 'triaged', 'in_progress', 'resolved', 'false_positive').required(),
  assigned_to: uuid.allow(null),
});

exports.createOnboardingKit = Joi.object({
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).allow(null, ''),
  device_category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).default('laptop'),
  preferred_os_family: Joi.string().valid(...Object.values(OS_FAMILY)).default('windows'),
  target_employee_types: Joi.array().items(Joi.string()).default([]),
  software_ids: Joi.array().items(uuid).default([]),
  baseline_control_ids: Joi.array().items(uuid).default([]),
  specs: Joi.object().default({}),
  is_default: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true),
});

exports.updateOnboardingKit = exports.createOnboardingKit
  .fork(['name'], (s) => s.optional())
  .keys({});

exports.provisionOnboarding = Joi.object({
  employee_id: uuid.required(),
  onboarding_kit_id: uuid.required(),
  device_id: uuid.allow(null),
  shipping_address: Joi.string().max(500).allow(null, ''),
  estimated_ready_date: Joi.date().iso().allow(null),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.advanceProvisionStatus = Joi.object({
  status: Joi.string().valid(...Object.values(ONBOARDING_PROVISION_STATUS)).required(),
  device_id: uuid.allow(null),
});
