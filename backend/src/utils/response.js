'use strict';

function success(res, data, statusCode = 200, meta = undefined) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function created(res, data, meta = undefined) {
  return success(res, data, 201, meta);
}

function noContent(res) {
  return res.status(204).send();
}

function failure(res, statusCode, code, message, details = undefined) {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { success, created, noContent, failure };
