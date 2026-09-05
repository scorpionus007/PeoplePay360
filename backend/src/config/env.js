'use strict';

require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function toBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

function toInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value, fallback) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: toInt(optional('PORT', '4000'), 4000),

  db: {
    host: required('DB_HOST', 'localhost'),
    port: toInt(optional('DB_PORT', '5432'), 5432),
    name: required('DB_NAME', 'peoplepay360'),
    user: required('DB_USER', 'peoplepay'),
    password: required('DB_PASSWORD', 'peoplepay_local_dev'),
    logging: toBool(optional('DB_LOGGING', 'false')),
    pool: {
      max: toInt(optional('DB_POOL_MAX', '10'), 10),
      min: toInt(optional('DB_POOL_MIN', '0'), 0),
      acquire: toInt(optional('DB_POOL_ACQUIRE', '30000'), 30000),
      idle: toInt(optional('DB_POOL_IDLE', '10000'), 10000),
    },
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'change_me_access_secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'change_me_refresh_secret'),
    accessTtl: optional('JWT_ACCESS_TTL', '15m'),
    refreshTtl: optional('JWT_REFRESH_TTL', '7d'),
    bcryptRounds: toInt(optional('BCRYPT_ROUNDS', '12'), 12),
  },

  cors: {
    origin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  },

  rateLimit: {
    windowMs: toInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 900000),
    max: toInt(optional('RATE_LIMIT_MAX', '300'), 300),
    authMax: toInt(optional('AUTH_RATE_LIMIT_MAX', '10'), 10),
  },

  log: {
    level: optional('LOG_LEVEL', 'info'),
  },

  payroll: {
    defaultCurrency: optional('DEFAULT_CURRENCY', 'USD'),
    advanceSalary: {
      maxPercent: toFloat(optional('ADVANCE_SALARY_MAX_PERCENT', '50'), 50),
      feePercent: toFloat(optional('ADVANCE_SALARY_FEE_PERCENT', '2.5'), 2.5),
      minEmiMonths: toInt(optional('ADVANCE_SALARY_MIN_EMI_MONTHS', '1'), 1),
      maxEmiMonths: toInt(optional('ADVANCE_SALARY_MAX_EMI_MONTHS', '12'), 12),
    },
  },
};

// In production, refuse to boot with the insecure development defaults so an
// operator can never accidentally sign tokens with a secret that is public in
// the source tree, or run against the default database password.
if (env.nodeEnv === 'production') {
  const insecure = [];
  if (!process.env.JWT_ACCESS_SECRET || env.jwt.accessSecret === 'change_me_access_secret') insecure.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET || env.jwt.refreshSecret === 'change_me_refresh_secret') insecure.push('JWT_REFRESH_SECRET');
  if (!process.env.DB_PASSWORD || env.db.password === 'peoplepay_local_dev') insecure.push('DB_PASSWORD');
  if (env.jwt.accessSecret === env.jwt.refreshSecret) insecure.push('JWT_ACCESS_SECRET must differ from JWT_REFRESH_SECRET');
  if (env.cors.origin === '*') insecure.push('CORS_ORIGIN must not be "*" in production');
  if (insecure.length) {
    throw new Error(
      `Refusing to start in production with insecure/default configuration: ${insecure.join(', ')}. Set strong values in the environment.`
    );
  }
}

module.exports = env;
