'use strict';

require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');

const env = require('./config/env');
const logger = require('./config/logger');
const { globalLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const rootRouter = require('./routes');
const swagger = require('./config/swagger');

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  // Never reflect an arbitrary origin together with credentials. When
  // CORS_ORIGIN is '*' we allow any origin but disable credentialed requests;
  // otherwise we use an explicit allowlist with credentials enabled.
  const corsWildcard = env.cors.origin === '*';
  app.use(
    cors({
      origin: corsWildcard ? true : env.cors.origin.split(',').map((s) => s.trim()),
      credentials: !corsWildcard,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(hpp());

  app.use(
    morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );

  swagger.mount(app);

  app.use('/api/v1', globalLimiter, rootRouter);

  app.use('/api/v1', notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
