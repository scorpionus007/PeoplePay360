'use strict';

const Joi = require('joi');
const { EMPLOYMENT_STATUS, EMPLOYEE_TYPE } = require('../../../config/constants');

const uuid = Joi.string().uuid();

exports.createOrganization = Joi.object({
  name: Joi.string().max(200).required(),
  legal_name: Joi.string().max(200).allow(null, ''),
  registration_number: Joi.string().max(120).allow(null, ''),
  domain: Joi.string().max(200).allow(null, ''),
  country_code: Joi.string().length(2).allow(null, ''),
  timezone: Joi.string().max(64).default('UTC'),
  base_currency: Joi.string().length(3).uppercase().default('USD'),
  metadata: Joi.object().default({}),
});

exports.updateOrganization = exports.createOrganization.fork(['name'], (s) => s.optional()).keys({});

exports.createDepartment = Joi.object({
  parent_id: uuid.allow(null),
  name: Joi.string().max(200).required(),
  code: Joi.string().max(50).allow(null, ''),
  description: Joi.string().max(500).allow(null, ''),
  is_active: Joi.boolean().default(true),
});

exports.updateDepartment = exports.createDepartment.fork(['name'], (s) => s.optional()).keys({});

exports.createEmployee = Joi.object({
  department_id: uuid.allow(null),
  manager_id: uuid.allow(null),
  employee_number: Joi.string().max(50).required(),
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).required(),
  email_work: Joi.string().email({ tlds: { allow: false } }).required(),
  email_personal: Joi.string().email({ tlds: { allow: false } }).allow(null, ''),
  phone: Joi.string().max(40).allow(null, ''),
  date_of_birth: Joi.date().iso().allow(null),
  gender: Joi.string().max(20).allow(null, ''),
  country_code: Joi.string().length(2).allow(null, ''),
  city: Joi.string().max(120).allow(null, ''),
  address_line1: Joi.string().max(255).allow(null, ''),
  address_line2: Joi.string().max(255).allow(null, ''),
  postal_code: Joi.string().max(30).allow(null, ''),
  job_title: Joi.string().max(150).allow(null, ''),
  employment_type: Joi.string()
    .valid(...Object.values(EMPLOYEE_TYPE))
    .default(EMPLOYEE_TYPE.FULL_TIME),
  employment_status: Joi.string()
    .valid(...Object.values(EMPLOYMENT_STATUS))
    .default(EMPLOYMENT_STATUS.ACTIVE),
  hire_date: Joi.date().iso().allow(null),
  termination_date: Joi.date().iso().allow(null),
  base_currency: Joi.string().length(3).uppercase().default('USD'),
  tax_country: Joi.string().length(2).allow(null, ''),
  tax_identifier: Joi.string().max(80).allow(null, ''),
  bank_account_number: Joi.string().max(80).allow(null, ''),
  bank_routing_number: Joi.string().max(80).allow(null, ''),
  bank_name: Joi.string().max(150).allow(null, ''),
  iban: Joi.string().max(50).allow(null, ''),
  swift_bic: Joi.string().max(20).allow(null, ''),
  metadata: Joi.object().default({}),
});

exports.updateEmployee = exports.createEmployee
  .fork(['employee_number', 'first_name', 'last_name', 'email_work'], (s) => s.optional())
  .keys({});

exports.idParam = Joi.object({ id: uuid.required() });
