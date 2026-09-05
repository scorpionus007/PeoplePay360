'use strict';

const Joi = require('joi');
const {
  VISA_TYPE,
  VISA_STATUS,
  RELOCATION_STATUS,
  IMMIGRATION_CASE_TYPE,
  IMMIGRATION_CASE_STATUS,
  TRAVEL_STATUS,
  MOBILITY_PARTNER_CATEGORY,
} = require('../../../config/constants');

const uuid = Joi.string().uuid();
const currency = Joi.string().length(3).uppercase();
const money = Joi.number().min(0).precision(4);
const iso2 = Joi.string().length(2).uppercase();
const email = Joi.string().email({ tlds: { allow: false } });

exports.idParam = Joi.object({ id: uuid.required() });
exports.idAndExpenseParams = Joi.object({ id: uuid.required(), expenseId: uuid.required() });

exports.createLocationStandard = Joi.object({
  country_code: iso2.required(),
  region_code: Joi.string().max(20).allow(null, ''),
  city: Joi.string().max(120).allow(null, ''),
  display_name: Joi.string().max(200).required(),
  currency: currency.default('USD'),
  timezone: Joi.string().max(64).default('UTC'),
  standard_weekly_hours: Joi.number().min(1).max(80).default(40),
  minimum_pto_days: Joi.number().integer().min(0).max(60).default(20),
  minimum_sick_days: Joi.number().integer().min(0).max(60).default(10),
  overtime_multiplier: Joi.number().min(1).max(5).default(1.5),
  minimum_wage_amount: money.allow(null),
  minimum_wage_period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'yearly').allow(null),
  probation_max_days: Joi.number().integer().min(0).max(730).allow(null),
  notice_period_days: Joi.number().integer().min(0).max(730).allow(null),
  social_security_percent: Joi.number().min(0).max(100).allow(null),
  employer_contribution_percent: Joi.number().min(0).max(100).allow(null),
  requires_work_visa_for_foreign_workers: Joi.boolean().default(true),
  permits_remote_work: Joi.boolean().default(true),
  public_holidays: Joi.array().items(Joi.object()).default([]),
  compliance_notes: Joi.string().allow(null, ''),
  is_active: Joi.boolean().default(true),
});
exports.updateLocationStandard = exports.createLocationStandard.fork(['country_code', 'display_name'], (s) => s.optional()).keys({});

exports.createPartner = Joi.object({
  name: Joi.string().max(200).required(),
  category: Joi.string().valid(...Object.values(MOBILITY_PARTNER_CATEGORY)).required(),
  country_code: iso2.allow(null),
  city: Joi.string().max(120).allow(null, ''),
  contact_name: Joi.string().max(200).allow(null, ''),
  contact_email: email.allow(null, ''),
  contact_phone: Joi.string().max(40).allow(null, ''),
  website: Joi.string().uri().max(500).allow(null, ''),
  contract_reference: Joi.string().max(200).allow(null, ''),
  contract_end_date: Joi.date().iso().allow(null),
  rating: Joi.number().min(0).max(10).allow(null),
  notes: Joi.string().max(2000).allow(null, ''),
  is_active: Joi.boolean().default(true),
});
exports.updatePartner = exports.createPartner.fork(['name', 'category'], (s) => s.optional()).keys({});

exports.initiateVisa = Joi.object({
  employee_id: uuid.required(),
  mobility_partner_id: uuid.allow(null),
  case_code: Joi.string().max(80).allow(null, ''),
  visa_type: Joi.string().valid(...Object.values(VISA_TYPE)).default('work_visa'),
  country_code: iso2.required(),
  visa_category: Joi.string().max(80).allow(null, ''),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  total_cost_amount: money.allow(null),
  currency: currency.default('USD'),
  metadata: Joi.object().default({}),
});

exports.visaTransition = Joi.object({
  status: Joi.string().valid(...Object.values(VISA_STATUS)).required(),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.visaDocument = Joi.object({
  document_type: Joi.string().max(120).required(),
  title: Joi.string().max(200).required(),
  file_url: Joi.string().uri().max(1000).allow(null, ''),
  expires_at: Joi.date().iso().allow(null),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.requestRelocation = Joi.object({
  employee_id: uuid.required(),
  mobility_partner_id: uuid.allow(null),
  case_code: Joi.string().max(80).allow(null, ''),
  from_country_code: iso2.required(),
  from_city: Joi.string().max(120).allow(null, ''),
  to_country_code: iso2.required(),
  to_city: Joi.string().max(120).allow(null, ''),
  reason: Joi.string().valid('new_role', 'transfer', 'promotion', 'return_home', 'other').default('new_role'),
  budget_amount: money.allow(null),
  budget_currency: currency.default('USD'),
  target_move_date: Joi.date().iso().allow(null),
  dependents_count: Joi.number().integer().min(0).max(20).default(0),
  notes: Joi.string().allow(null, ''),
});

exports.approveRelocation = Joi.object({
  budget_amount: money.allow(null),
  budget_currency: currency.allow(null),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.relocationTransition = Joi.object({
  status: Joi.string().valid(...Object.values(RELOCATION_STATUS)).required(),
  actual_move_date: Joi.date().iso().allow(null),
});

exports.relocationExpense = Joi.object({
  category: Joi.string().valid('flights', 'shipping', 'housing', 'temporary_stay', 'visa_fees', 'legal', 'transport', 'per_diem', 'other').default('other'),
  description: Joi.string().max(500).required(),
  amount: money.required(),
  currency: currency.default('USD'),
  incurred_on: Joi.date().iso().required(),
  receipt_url: Joi.string().uri().max(1000).allow(null, ''),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.reviewExpense = Joi.object({
  decision: Joi.string().valid('approved', 'rejected', 'reimbursed').required(),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.createImmigration = Joi.object({
  employee_id: uuid.required(),
  mobility_partner_id: uuid.allow(null),
  case_code: Joi.string().max(80).allow(null, ''),
  case_type: Joi.string().valid(...Object.values(IMMIGRATION_CASE_TYPE)).required(),
  country_code: iso2.required(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  dependents_count: Joi.number().integer().min(0).max(20).default(0),
  next_action_due: Joi.date().iso().allow(null),
  summary: Joi.string().max(2000).allow(null, ''),
  notes: Joi.string().allow(null, ''),
  assigned_to: uuid.allow(null),
});

exports.updateImmigration = Joi.object({
  status: Joi.string().valid(...Object.values(IMMIGRATION_CASE_STATUS)),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  dependents_count: Joi.number().integer().min(0).max(20),
  next_action_due: Joi.date().iso().allow(null),
  summary: Joi.string().max(2000).allow(null, ''),
  notes: Joi.string().allow(null, ''),
  assigned_to: uuid.allow(null),
});

exports.resolveImmigration = Joi.object({ summary: Joi.string().max(2000).allow(null, '') });

exports.submitTravel = Joi.object({
  employee_id: uuid.allow(null),
  code: Joi.string().max(80).allow(null, ''),
  purpose: Joi.string().max(500).required(),
  trip_type: Joi.string().valid('business', 'client_visit', 'training', 'conference', 'onboarding', 'relocation', 'other').default('business'),
  from_country_code: iso2.allow(null),
  from_city: Joi.string().max(120).allow(null, ''),
  to_country_code: iso2.required(),
  to_city: Joi.string().max(120).allow(null, ''),
  depart_date: Joi.date().iso().required(),
  return_date: Joi.date().iso().required(),
  estimated_cost: money.allow(null),
  currency: currency.default('USD'),
  requires_visa: Joi.boolean().default(false),
  itinerary: Joi.object().default({}),
});

exports.travelNote = Joi.object({
  note: Joi.string().max(1000).allow(null, ''),
});

exports.bookTravel = Joi.object({
  booking_reference: Joi.string().max(200).required(),
});
