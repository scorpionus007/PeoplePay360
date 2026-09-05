'use strict';

const AppError = require('../utils/AppError');

const validSegments = ['body', 'query', 'params'];

function validate(schemasBySegment) {
  return function validationMiddleware(req, res, next) {
    try {
      for (const segment of validSegments) {
        const schema = schemasBySegment[segment];
        if (!schema) continue;

        const { value, error } = schema.validate(req[segment], {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
          return next(AppError.unprocessable('Validation failed', details));
        }
        req[segment] = value;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { validate };
