'use strict';

const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function hashPassword(plain) {
  return bcrypt.hash(plain, env.jwt.bcryptRounds);
}

async function verifyPassword(plain, hashed) {
  if (!plain || !hashed) return false;
  return bcrypt.compare(plain, hashed);
}

module.exports = { hashPassword, verifyPassword };
