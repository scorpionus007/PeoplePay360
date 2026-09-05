'use strict';

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }
  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }
  static conflict(message, details) {
    return new AppError(message, 409, 'CONFLICT', details);
  }
  static unprocessable(message, details) {
    return new AppError(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
  static tooMany(message = 'Too many requests') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }
  static internal(message = 'Internal server error', details) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }
}

module.exports = AppError;
