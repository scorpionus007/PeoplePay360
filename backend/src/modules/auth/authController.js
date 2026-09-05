'use strict';

const authService = require('./authService');
const { success, created } = require('../../utils/response');

async function login(req, res) {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  return success(res, result);
}

async function refresh(req, res) {
  const result = await authService.refresh({
    refreshToken: req.body.refresh_token,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  return success(res, result);
}

async function logout(req, res) {
  await authService.logout({ userId: req.user ? req.user.id : null });
  return success(res, { logged_out: true });
}

async function me(req, res) {
  const me = await authService.me(req.user.id);
  return success(res, me);
}

async function register(req, res) {
  const user = await authService.register({
    organizationId: req.user.organizationId,
    email: req.body.email,
    password: req.body.password,
    fullName: req.body.full_name,
    roleKeys: req.body.role_keys || [],
    actorRoles: req.user.roles || [],
  });
  return created(res, user);
}

module.exports = { login, refresh, logout, me, register };
