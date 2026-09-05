'use strict';

const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { requireAuth } = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validator');
const { authLimiter } = require('../../middleware/rateLimit');
const controller = require('./authController');
const V = require('./authValidators');
const { PERMISSIONS } = require('../../config/constants');

const router = express.Router();

router.post('/login', authLimiter, validate({ body: V.login }), asyncHandler(controller.login));
router.post('/refresh', authLimiter, validate({ body: V.refresh }), asyncHandler(controller.refresh));
router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.get('/me', requireAuth, asyncHandler(controller.me));
router.post(
  '/register',
  requireAuth,
  requirePermission(PERMISSIONS.USER_MANAGE),
  validate({ body: V.register }),
  asyncHandler(controller.register)
);

module.exports = router;
