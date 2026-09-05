'use strict';

const Joi = require('joi');

exports.login = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).required(),
});

exports.refresh = Joi.object({
  refresh_token: Joi.string().required(),
});

exports.register = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).required(),
  full_name: Joi.string().min(2).max(200).required(),
  role_keys: Joi.array().items(Joi.string()).default([]),
});
