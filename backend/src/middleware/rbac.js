'use strict';

const AppError = require('../utils/AppError');
const { ROLES } = require('../config/constants');

function hasRole(user, role) {
  return user && Array.isArray(user.roles) && user.roles.includes(role);
}

function hasAnyRole(user, roles) {
  if (!user || !Array.isArray(user.roles)) return false;
  return roles.some((r) => user.roles.includes(r));
}

function hasPermission(user, permission) {
  if (!user) return false;
  if (hasRole(user, ROLES.ADMIN)) return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) return next(AppError.unauthorized());
    if (hasRole(req.user, ROLES.ADMIN)) return next();
    if (hasAnyRole(req.user, roles)) return next();
    return next(AppError.forbidden('Insufficient role privileges'));
  };
}

function requirePermission(...permissions) {
  return function permissionGuard(req, res, next) {
    if (!req.user) return next(AppError.unauthorized());
    if (hasRole(req.user, ROLES.ADMIN)) return next();
    const ok = permissions.every((p) => req.user.permissions.includes(p));
    if (!ok) return next(AppError.forbidden('Missing required permission'));
    return next();
  };
}

function requireAnyPermission(...permissions) {
  return function anyPermissionGuard(req, res, next) {
    if (!req.user) return next(AppError.unauthorized());
    if (hasRole(req.user, ROLES.ADMIN)) return next();
    const ok = permissions.some((p) => req.user.permissions.includes(p));
    if (!ok) return next(AppError.forbidden('Missing required permission'));
    return next();
  };
}

function requireSameOrganization(orgIdExtractor) {
  return function sameOrgGuard(req, res, next) {
    if (!req.user) return next(AppError.unauthorized());
    if (hasRole(req.user, ROLES.ADMIN)) return next();
    const targetOrgId = orgIdExtractor(req);
    if (!targetOrgId || targetOrgId !== req.user.organizationId) {
      return next(AppError.forbidden('Cross organization access denied'));
    }
    return next();
  };
}

module.exports = {
  hasRole,
  hasAnyRole,
  hasPermission,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireSameOrganization,
};
