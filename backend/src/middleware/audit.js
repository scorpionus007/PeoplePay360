'use strict';

const logger = require('../config/logger');
const { models } = require('../models');

async function writeAudit({ actorUserId, organizationId, action, entityType, entityId, before, after, ip, userAgent }) {
  try {
    await models.AuditLog.create({
      actor_user_id: actorUserId || null,
      organization_id: organizationId || null,
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      before_state: before || null,
      after_state: after || null,
      ip_address: ip || null,
      user_agent: userAgent || null,
    });
  } catch (err) {
    logger.error('Failed to write audit log: %s', err.message);
  }
}

function auditRequest(actionResolver) {
  return function auditMiddleware(req, res, next) {
    res.on('finish', () => {
      if (res.statusCode >= 400) return;
      const action = typeof actionResolver === 'function' ? actionResolver(req, res) : actionResolver;
      writeAudit({
        actorUserId: req.user ? req.user.id : null,
        organizationId: req.user ? req.user.organizationId : null,
        action,
        entityType: req.baseUrl || 'unknown',
        entityId: req.params.id || null,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    });
    next();
  };
}

module.exports = { writeAudit, auditRequest };
