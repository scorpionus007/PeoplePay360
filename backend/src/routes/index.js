'use strict';

const express = require('express');
const { success } = require('../utils/response');
const authRoutes = require('../modules/auth/authRoutes');
const coreRoutes = require('../modules/core/routes');
const payrollRoutes = require('../modules/payroll/routes');
const hrRoutes = require('../modules/hr/routes');
const itAdminRoutes = require('../modules/itAdmin/routes');
const benefitsRoutes = require('../modules/benefits/routes');
const hiringRoutes = require('../modules/hiring/routes');
const mobilityRoutes = require('../modules/mobility/routes');

const router = express.Router();

router.get('/health', (req, res) => success(res, { status: 'ok', service: 'peoplepay360-backend' }));

router.use('/auth', authRoutes);
router.use('/', coreRoutes);
router.use('/hr', hrRoutes);
router.use('/it', itAdminRoutes);
router.use('/benefits', benefitsRoutes);
router.use('/hiring', hiringRoutes);
router.use('/mobility', mobilityRoutes);
router.use('/payroll', payrollRoutes);

module.exports = router;
