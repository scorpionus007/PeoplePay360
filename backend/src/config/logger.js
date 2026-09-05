'use strict';

const { createLogger, format, transports } = require('winston');
const env = require('./env');

const logger = createLogger({
  level: env.log.level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    env.nodeEnv === 'production'
      ? format.json()
      : format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
        })
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
