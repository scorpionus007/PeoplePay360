'use strict';

const Joi = require('joi');
const {
  SALARY_RULE_CATEGORY,
  SALARY_RULE_COMPUTE_TYPE,
  CONTRACT_STATUS,
  ADVANCE_SALARY_REPAYMENT_MODE,
  BONUS_TYPE,
  PAYMENT_METHOD_TYPE,
} = require('../../../config/constants');

const uuid = Joi.string().uuid();
const currency = Joi.string().length(3).uppercase();
const money = Joi.number().min(0).precision(4);
const percent = Joi.number().min(0).max(1000).precision(4);

exports.createSalaryStructure = Joi.object({
  code: Joi.string().max(80).required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).allow(null, ''),
  currency: currency.default('USD'),
  effective_from: Joi.date().iso().allow(null),
  effective_to: Joi.date().iso().allow(null),
  is_active: Joi.boolean().default(true),
});

exports.updateSalaryStructure = exports.createSalaryStructure
  .fork(['code', 'name'], (schema) => schema.optional())
  .keys({});

exports.setStructureRules = Joi.object({
  rules: Joi.array()
    .items(
      Joi.object({
        salary_rule_id: uuid.required(),
        sequence: Joi.number().integer().min(1).max(10000).default(100),
        override_amount: money.allow(null),
        override_percent: percent.allow(null),
        is_active: Joi.boolean().default(true),
      })
    )
    .required(),
});

exports.createSalaryRule = Joi.object({
  code: Joi.string().max(80).required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(1000).allow(null, ''),
  category: Joi.string()
    .valid(...Object.values(SALARY_RULE_CATEGORY))
    .required(),
  compute_type: Joi.string()
    .valid(...Object.values(SALARY_RULE_COMPUTE_TYPE))
    .required(),
  fixed_amount: money.allow(null),
  percent_value: percent.allow(null),
  percent_of_category: Joi.string()
    .valid(...Object.values(SALARY_RULE_CATEGORY))
    .allow(null),
  formula: Joi.string().max(2000).allow(null, ''),
  taxable: Joi.boolean().default(false),
  appears_on_payslip: Joi.boolean().default(true),
  is_active: Joi.boolean().default(true),
});

exports.updateSalaryRule = exports.createSalaryRule
  .fork(['code', 'name', 'category', 'compute_type'], (schema) => schema.optional())
  .keys({});

exports.createContract = Joi.object({
  employee_id: uuid.required(),
  salary_structure_id: uuid.allow(null),
  working_schedule_id: uuid.allow(null),
  title: Joi.string().max(200).required(),
  department: Joi.string().max(150).allow(null, ''),
  position: Joi.string().max(150).allow(null, ''),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().allow(null),
  wage_amount: money.required(),
  wage_currency: currency.default('USD'),
  wage_period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'yearly').default('monthly'),
  probation_end_date: Joi.date().iso().allow(null),
  notice_period_days: Joi.number().integer().min(0).max(365).allow(null),
  status: Joi.string()
    .valid(...Object.values(CONTRACT_STATUS))
    .default(CONTRACT_STATUS.DRAFT),
  terms: Joi.string().allow(null, ''),
  metadata: Joi.object().default({}),
});

exports.updateContract = exports.createContract
  .fork(['employee_id', 'title', 'start_date', 'wage_amount'], (schema) => schema.optional())
  .keys({});

exports.createPayrun = Joi.object({
  name: Joi.string().max(200).required(),
  code: Joi.string().max(80).required(),
  salary_structure_id: uuid.allow(null),
  period_start: Joi.date().iso().required(),
  period_end: Joi.date().iso().required(),
  payment_date: Joi.date().iso().allow(null),
  currency: currency.default('USD'),
  employee_ids: Joi.array().items(uuid.required()).min(1).required(),
  department_scope: Joi.array().items(uuid).allow(null),
  employee_type_scope: Joi.array().items(Joi.string()).allow(null),
});

exports.suggestSalaryChange = Joi.object({
  employee_id: uuid.required(),
  change_type: Joi.string().valid('increment', 'decrement').required(),
  amount: money.allow(null),
  percent: percent.allow(null),
  reason: Joi.string().max(1000).required(),
  effective_from: Joi.date().iso().allow(null),
});

exports.payrollDecideSalaryChange = Joi.object({
  decided_amount: money.required(),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.adminApproveSalaryChange = Joi.object({
  note: Joi.string().max(1000).allow(null, ''),
});

exports.rejectSalaryChange = Joi.object({
  note: Joi.string().max(1000).allow(null, ''),
});

exports.requestAdvanceSalary = Joi.object({
  employee_id: uuid.allow(null),
  requested_amount: money.required(),
  repayment_mode: Joi.string()
    .valid(...Object.values(ADVANCE_SALARY_REPAYMENT_MODE))
    .required(),
  emi_months: Joi.number().integer().min(1).max(60).allow(null),
  reason: Joi.string().max(1000).allow(null, ''),
});

exports.approveAdvanceSalary = Joi.object({
  approved_amount: money.allow(null),
});

exports.recordAdvanceRepayment = Joi.object({
  mode: Joi.string()
    .valid(...Object.values(ADVANCE_SALARY_REPAYMENT_MODE))
    .required(),
  amount: money.required(),
  currency: currency.allow(null),
  payslip_id: uuid.allow(null),
  external_reference: Joi.string().max(255).allow(null, ''),
  note: Joi.string().max(500).allow(null, ''),
});

exports.convertAdvanceToEmi = Joi.object({
  emi_months: Joi.number().integer().min(1).max(60).required(),
});

exports.createBonus = Joi.object({
  employee_id: uuid.required(),
  contract_id: uuid.allow(null),
  bonus_type: Joi.string()
    .valid(...Object.values(BONUS_TYPE))
    .default('discretionary'),
  amount: money.required(),
  currency: currency.default('USD'),
  taxable: Joi.boolean().default(true),
  grant_date: Joi.date().iso().required(),
  payout_period: Joi.date().iso().allow(null),
  reason: Joi.string().max(1000).allow(null, ''),
});

exports.createPaymentMethod = Joi.object({
  method_type: Joi.string()
    .valid(...Object.values(PAYMENT_METHOD_TYPE))
    .required(),
  currency: currency.default('USD'),
  is_primary: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true),
  account_holder_name: Joi.string().max(200).allow(null, ''),
  account_number: Joi.string().max(120).allow(null, ''),
  routing_number: Joi.string().max(80).allow(null, ''),
  bank_name: Joi.string().max(150).allow(null, ''),
  iban: Joi.string().max(50).allow(null, ''),
  swift_bic: Joi.string().max(20).allow(null, ''),
  country_code: Joi.string().length(2).allow(null, ''),
  details: Joi.object().default({}),
});

exports.updatePaymentMethod = exports.createPaymentMethod
  .fork(['method_type'], (schema) => schema.optional())
  .keys({});

exports.idParam = Joi.object({ id: uuid.required() });
exports.employeeIdParam = Joi.object({ employeeId: uuid.required() });
exports.employeeAndIdParams = Joi.object({ employeeId: uuid.required(), id: uuid.required() });
