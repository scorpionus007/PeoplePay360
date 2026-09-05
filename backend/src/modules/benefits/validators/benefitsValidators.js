'use strict';

const Joi = require('joi');
const {
  BENEFIT_CATEGORY,
  BENEFIT_PLAN_STATUS,
  BENEFIT_ENROLLMENT_STATUS,
  BENEFIT_CLAIM_STATUS,
  DEPENDENT_RELATION,
  LOAN_STATUS,
  LOAN_INTEREST_MODE,
  VOUCHER_STATUS,
} = require('../../../config/constants');

const uuid = Joi.string().uuid();
const currency = Joi.string().length(3).uppercase();
const money = Joi.number().min(0).precision(4);

exports.idParam = Joi.object({ id: uuid.required() });

exports.createProvider = Joi.object({
  name: Joi.string().max(200).required(),
  category: Joi.string().valid(...Object.values(BENEFIT_CATEGORY)).required(),
  contact_email: Joi.string().email({ tlds: { allow: false } }).allow(null, ''),
  contact_phone: Joi.string().max(40).allow(null, ''),
  website: Joi.string().uri().max(500).allow(null, ''),
  country_code: Joi.string().length(2).allow(null, ''),
  support_hours: Joi.string().max(200).allow(null, ''),
  account_reference: Joi.string().max(200).allow(null, ''),
  notes: Joi.string().max(2000).allow(null, ''),
  is_active: Joi.boolean().default(true),
});
exports.updateProvider = exports.createProvider.fork(['name', 'category'], (s) => s.optional()).keys({});

exports.createPlan = Joi.object({
  provider_id: uuid.allow(null),
  code: Joi.string().max(80).required(),
  name: Joi.string().max(200).required(),
  category: Joi.string().valid(...Object.values(BENEFIT_CATEGORY)).required(),
  description: Joi.string().max(2000).allow(null, ''),
  currency: currency.default('USD'),
  employer_cost_amount: money.allow(null),
  employee_cost_amount: money.allow(null),
  cost_frequency: Joi.string().valid('per_month', 'per_year', 'per_payroll', 'one_time').default('per_month'),
  coverage_amount: money.allow(null),
  dependents_allowed: Joi.boolean().default(false),
  max_dependents: Joi.number().integer().min(0).max(20).allow(null),
  taxable: Joi.boolean().default(false),
  requires_enrollment: Joi.boolean().default(true),
  auto_enroll: Joi.boolean().default(false),
  approval_required: Joi.boolean().default(true),
  effective_from: Joi.date().iso().allow(null),
  effective_to: Joi.date().iso().allow(null),
  total_seats: Joi.number().integer().min(0).max(1000000).allow(null),
  status: Joi.string().valid(...Object.values(BENEFIT_PLAN_STATUS)).default('draft'),
  eligibility: Joi.object().default({}),
  metadata: Joi.object().default({}),
});
exports.updatePlan = exports.createPlan.fork(['code', 'name', 'category'], (s) => s.optional()).keys({});

exports.enroll = Joi.object({
  employee_id: uuid.allow(null),
  benefit_plan_id: uuid.required(),
  start_date: Joi.date().iso().required(),
  elected_amount: money.allow(null),
  notes: Joi.string().max(1000).allow(null, ''),
  dependents: Joi.array()
    .items(
      Joi.object({
        first_name: Joi.string().max(100).required(),
        last_name: Joi.string().max(100).required(),
        relation: Joi.string().valid(...Object.values(DEPENDENT_RELATION)).required(),
        date_of_birth: Joi.date().iso().allow(null),
        gender: Joi.string().max(20).allow(null, ''),
        national_id: Joi.string().max(80).allow(null, ''),
      })
    )
    .default([]),
});

exports.declineEnrollment = Joi.object({ note: Joi.string().max(1000).allow(null, '') });
exports.waiveEnrollment = Joi.object({ reason: Joi.string().max(500).allow(null, '') });
exports.terminateEnrollment = Joi.object({
  end_date: Joi.date().iso().allow(null),
  reason: Joi.string().max(1000).allow(null, ''),
});

exports.submitClaim = Joi.object({
  employee_id: uuid.allow(null),
  benefit_enrollment_id: uuid.required(),
  subject: Joi.string().max(200).required(),
  description: Joi.string().max(20000).allow(null, ''),
  incurred_on: Joi.date().iso().required(),
  claim_amount: money.required(),
  currency: currency.allow(null),
  documents: Joi.array().items(Joi.object()).default([]),
});
exports.reviewClaim = Joi.object({
  approved_amount: money.allow(null),
  note: Joi.string().max(1000).allow(null, ''),
});
exports.reimburseClaim = Joi.object({
  reimbursed_amount: money.allow(null),
  external_reference: Joi.string().max(200).allow(null, ''),
});

exports.createLoanProgram = Joi.object({
  code: Joi.string().max(80).required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(2000).allow(null, ''),
  currency: currency.default('USD'),
  min_amount: money.default(0),
  max_amount: money.required(),
  min_tenure_months: Joi.number().integer().min(1).max(120).default(1),
  max_tenure_months: Joi.number().integer().min(1).max(120).default(24),
  interest_mode: Joi.string().valid(...Object.values(LOAN_INTEREST_MODE)).default('zero'),
  interest_rate_percent: Joi.number().min(0).max(100).default(0),
  processing_fee_percent: Joi.number().min(0).max(100).default(0),
  requires_manager_approval: Joi.boolean().default(true),
  requires_admin_approval: Joi.boolean().default(false),
  salary_deduction_default: Joi.boolean().default(true),
  is_active: Joi.boolean().default(true),
});
exports.updateLoanProgram = exports.createLoanProgram.fork(['code', 'name', 'max_amount'], (s) => s.optional()).keys({});

exports.applyLoan = Joi.object({
  employee_id: uuid.allow(null),
  loan_program_id: uuid.required(),
  requested_amount: money.required(),
  tenure_months: Joi.number().integer().min(1).max(120).required(),
  reason: Joi.string().max(1000).allow(null, ''),
});
exports.managerReviewLoan = Joi.object({
  approve: Joi.boolean().default(true),
  decided_amount: money.allow(null),
  note: Joi.string().max(1000).allow(null, ''),
});
exports.adminReviewLoan = Joi.object({
  approve: Joi.boolean().default(true),
  note: Joi.string().max(1000).allow(null, ''),
});
exports.recordLoanRepayment = Joi.object({
  mode: Joi.string().valid('salary_deduction', 'direct_transfer', 'external').required(),
  amount: money.required(),
  currency: currency.allow(null),
  payslip_id: uuid.allow(null),
  external_reference: Joi.string().max(200).allow(null, ''),
  note: Joi.string().max(500).allow(null, ''),
});

exports.issueVoucher = Joi.object({
  employee_id: uuid.allow(null),
  partner_name: Joi.string().max(150).allow(null, ''),
  category: Joi.string().max(80).allow(null, ''),
  amount: money.required(),
  currency: currency.default('USD'),
  valid_from: Joi.date().iso().allow(null),
  valid_to: Joi.date().iso().allow(null),
  note: Joi.string().max(500).allow(null, ''),
});
exports.redeemVoucher = Joi.object({
  redemption_reference: Joi.string().max(200).allow(null, ''),
});

exports.createDiscountPartner = Joi.object({
  name: Joi.string().max(200).required(),
  category: Joi.string().max(80).allow(null, ''),
  description: Joi.string().max(2000).allow(null, ''),
  website: Joi.string().uri().max(500).allow(null, ''),
  discount_percent: Joi.number().min(0).max(100).allow(null),
  discount_code: Joi.string().max(120).allow(null, ''),
  terms: Joi.string().max(2000).allow(null, ''),
  valid_from: Joi.date().iso().allow(null),
  valid_to: Joi.date().iso().allow(null),
  contact_name: Joi.string().max(150).allow(null, ''),
  contact_email: Joi.string().email({ tlds: { allow: false } }).allow(null, ''),
  is_active: Joi.boolean().default(true),
});
exports.updateDiscountPartner = exports.createDiscountPartner.fork(['name'], (s) => s.optional()).keys({});

// Convenience so validators can consume the enum lists too
exports.enums = {
  BENEFIT_CATEGORY,
  BENEFIT_PLAN_STATUS,
  BENEFIT_ENROLLMENT_STATUS,
  BENEFIT_CLAIM_STATUS,
  LOAN_STATUS,
  VOUCHER_STATUS,
};
