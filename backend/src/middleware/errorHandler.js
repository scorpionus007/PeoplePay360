'use strict';

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const { failure } = require('../utils/response');

function notFound(req, res) {
  return failure(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return failure(res, 422, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  if (err && err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return failure(res, 409, 'CONFLICT', 'Unique constraint violation', details);
  }

  if (err && err.name === 'SequelizeForeignKeyConstraintError') {
    // Do not leak internal table/constraint names to the client.
    return failure(res, 409, 'CONFLICT', 'Related record constraint violation');
  }

  if (err && err.name === 'JsonWebTokenError') {
    return failure(res, 401, 'INVALID_TOKEN', 'Invalid authentication token');
  }

  if (err && err.name === 'TokenExpiredError') {
    return failure(res, 401, 'TOKEN_EXPIRED', 'Authentication token has expired');
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(err);
    return failure(res, err.statusCode, err.code, err.message, err.details);
  }

  logger.error(err);
  return failure(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}

module.exports = { notFound, errorHandler };
