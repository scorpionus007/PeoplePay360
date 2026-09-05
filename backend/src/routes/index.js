'use strict';

const express = require('express');
const { success } = require('../utils/response');
const authRoutes = require('../modules/auth/authRoutes');
const coreRoutes = require('../modules/core/routes');
const payrollRoutes = require('../modules/payroll/routes');

const router = express.Router();

router.get('/health', (req, res) => success(res, { status: 'ok', service: 'peoplepay360-backend' }));

router.use('/auth', authRoutes);
router.use('/', coreRoutes);
router.use('/payroll', payrollRoutes);

module.exports = router;
