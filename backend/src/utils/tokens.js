'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const ALG = 'HS256';

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, {
    algorithm: ALG,
    expiresIn: env.jwt.accessTtl,
    issuer: 'peoplepay360',
    audience: 'peoplepay360-api',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    algorithm: ALG,
    expiresIn: env.jwt.refreshTtl,
    issuer: 'peoplepay360',
    audience: 'peoplepay360-refresh',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret, {
    algorithms: [ALG],
    issuer: 'peoplepay360',
    audience: 'peoplepay360-api',
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret, {
    algorithms: [ALG],
    issuer: 'peoplepay360',
    audience: 'peoplepay360-refresh',
  });
}

function newTokenId() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  newTokenId,
};
