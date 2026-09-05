'use strict';

const crypto = require('crypto');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { models } = require('../../models');
const AppError = require('../../utils/AppError');
const {
  hashPassword,
  verifyPassword,
} = require('../../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  newTokenId,
} = require('../../utils/tokens');
const env = require('../../config/env');

function ttlToDate(ttl) {
  const match = /^(\d+)([smhdw])$/.exec(ttl);
  if (!match) return dayjs().add(15, 'minute').toDate();
  const [, value, unit] = match;
  const unitMap = { s: 'second', m: 'minute', h: 'hour', d: 'day', w: 'week' };
  return dayjs().add(parseInt(value, 10), unitMap[unit]).toDate();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function loadUserWithRoles(userId) {
  return models.User.findByPk(userId, {
    include: [
      {
        model: models.Role,
        as: 'roles',
        through: { attributes: [] },
        include: [
          {
            model: models.Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      },
      { model: models.Organization, as: 'organization' },
      { model: models.Employee, as: 'employee' },
    ],
  });
}

function summarizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    organization_id: user.organization_id,
    organization: user.organization
      ? { id: user.organization.id, name: user.organization.name, base_currency: user.organization.base_currency }
      : null,
    employee_id: user.employee_id,
    employee: user.employee
      ? {
          id: user.employee.id,
          employee_number: user.employee.employee_number,
          first_name: user.employee.first_name,
          last_name: user.employee.last_name,
        }
      : null,
    is_active: user.is_active,
    mfa_enabled: user.mfa_enabled,
    roles: (user.roles || []).map((r) => r.key),
    permissions: Array.from(
      new Set((user.roles || []).flatMap((r) => (r.permissions || []).map((p) => p.key)))
    ),
  };
}

async function issueTokens({ user, ip, userAgent }) {
  const tokenId = newTokenId();
  const access = signAccessToken({ sub: user.id, org: user.organization_id, tid: tokenId });
  const refresh = signRefreshToken({ sub: user.id, org: user.organization_id, tid: tokenId });
  const refreshHash = hashToken(refresh);

  await models.RefreshToken.create({
    user_id: user.id,
    token_id: tokenId,
    token_hash: refreshHash,
    expires_at: ttlToDate(env.jwt.refreshTtl),
    ip_address: ip || null,
    user_agent: userAgent || null,
  });

  return { access_token: access, refresh_token: refresh, token_id: tokenId };
}

async function login({ email, password, ip, userAgent }) {
  const user = await models.User.scope('withPassword').findOne({ where: { email: String(email).toLowerCase() } });
  if (!user) throw AppError.unauthorized('Invalid credentials');
  if (!user.is_active) throw AppError.forbidden('Account is deactivated');

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw AppError.unauthorized('Invalid credentials');

  user.last_login_at = new Date();
  await user.save();

  const tokens = await issueTokens({ user, ip, userAgent });
  const full = await loadUserWithRoles(user.id);
  return { tokens, user: summarizeUser(full) };
}

async function refresh({ refreshToken, ip, userAgent }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_err) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const record = await models.RefreshToken.findOne({ where: { token_id: payload.tid, user_id: payload.sub } });
  if (!record) throw AppError.unauthorized('Refresh token not recognized');
  if (record.revoked_at) throw AppError.unauthorized('Refresh token has been revoked');
  if (record.expires_at < new Date()) throw AppError.unauthorized('Refresh token expired');
  if (record.token_hash !== hashToken(refreshToken)) throw AppError.unauthorized('Refresh token mismatch');

  const user = await models.User.findByPk(payload.sub);
  if (!user || !user.is_active) throw AppError.unauthorized('User no longer active');

  const rotated = await issueTokens({ user, ip, userAgent });
  record.revoked_at = new Date();
  record.replaced_by_token_id = rotated.token_id;
  await record.save();

  const full = await loadUserWithRoles(user.id);
  return { tokens: rotated, user: summarizeUser(full) };
}

async function logout({ userId, tokenId }) {
  if (!userId) return;
  const where = { user_id: userId, revoked_at: null };
  if (tokenId) where.token_id = tokenId;
  await models.RefreshToken.update({ revoked_at: new Date() }, { where });
}

async function register({ organizationId, email, password, fullName, roleKeys = [] }) {
  const existing = await models.User.findOne({ where: { email: String(email).toLowerCase() } });
  if (existing) throw AppError.conflict('Email already registered');

  const passwordHash = await hashPassword(password);
  const user = await models.User.create({
    organization_id: organizationId,
    email: String(email).toLowerCase(),
    password_hash: passwordHash,
    full_name: fullName,
  });

  if (roleKeys.length) {
    const roles = await models.Role.findAll({ where: { key: { [Op.in]: roleKeys } } });
    await user.addRoles(roles);
  }

  return loadUserWithRoles(user.id).then(summarizeUser);
}

async function me(userId) {
  const user = await loadUserWithRoles(userId);
  if (!user) throw AppError.notFound('User not found');
  return summarizeUser(user);
}

module.exports = { login, refresh, logout, register, me, summarizeUser };
