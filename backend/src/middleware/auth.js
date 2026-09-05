'use strict';

const { verifyAccessToken } = require('../utils/tokens');
const AppError = require('../utils/AppError');
const { models } = require('../models');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw AppError.unauthorized('Missing authentication token');

    const payload = verifyAccessToken(token);

    const user = await models.User.findByPk(payload.sub, {
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
      ],
    });

    if (!user) throw AppError.unauthorized('User no longer exists');
    if (!user.is_active) throw AppError.forbidden('User is deactivated');

    const roleKeys = user.roles.map((r) => r.key);
    const permissionKeys = Array.from(
      new Set(user.roles.flatMap((r) => (r.permissions || []).map((p) => p.key)))
    );

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      employeeId: user.employee_id,
      roles: roleKeys,
      permissions: permissionKeys,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  return requireAuth(req, res, next);
}

module.exports = { requireAuth, optionalAuth };
