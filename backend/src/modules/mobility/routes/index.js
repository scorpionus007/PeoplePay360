'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/mobilityValidators');

const locationStandard = require('../controllers/locationStandardController');
const partner = require('../controllers/mobilityPartnerController');
const visa = require('../controllers/visaController');
const relocation = require('../controllers/relocationController');
const immigration = require('../controllers/immigrationController');
const travel = require('../controllers/travelController');
const dashboard = require('../controllers/mobilityDashboardController');

const router = express.Router();
router.use(requireAuth);

// Location standards
router.get('/location-standards', requirePermission(PERMISSIONS.LOCATION_STANDARD_READ), asyncHandler(locationStandard.list));
router.post('/location-standards', requirePermission(PERMISSIONS.LOCATION_STANDARD_WRITE), validate({ body: V.createLocationStandard }), asyncHandler(locationStandard.create));
router.get('/location-standards/:id', requirePermission(PERMISSIONS.LOCATION_STANDARD_READ), validate({ params: V.idParam }), asyncHandler(locationStandard.getOne));
router.patch('/location-standards/:id', requirePermission(PERMISSIONS.LOCATION_STANDARD_WRITE), validate({ params: V.idParam, body: V.updateLocationStandard }), asyncHandler(locationStandard.update));
router.delete('/location-standards/:id', requirePermission(PERMISSIONS.LOCATION_STANDARD_WRITE), validate({ params: V.idParam }), asyncHandler(locationStandard.remove));

// Mobility partners
router.get('/partners', requirePermission(PERMISSIONS.MOBILITY_PARTNER_READ), asyncHandler(partner.list));
router.post('/partners', requirePermission(PERMISSIONS.MOBILITY_PARTNER_WRITE), validate({ body: V.createPartner }), asyncHandler(partner.create));
router.get('/partners/:id', requirePermission(PERMISSIONS.MOBILITY_PARTNER_READ), validate({ params: V.idParam }), asyncHandler(partner.getOne));
router.patch('/partners/:id', requirePermission(PERMISSIONS.MOBILITY_PARTNER_WRITE), validate({ params: V.idParam, body: V.updatePartner }), asyncHandler(partner.update));
router.delete('/partners/:id', requirePermission(PERMISSIONS.MOBILITY_PARTNER_WRITE), validate({ params: V.idParam }), asyncHandler(partner.remove));

// Visa sponsorships
router.get('/visas', requirePermission(PERMISSIONS.VISA_READ), asyncHandler(visa.list));
router.post('/visas', requirePermission(PERMISSIONS.VISA_WRITE), validate({ body: V.initiateVisa }), asyncHandler(visa.initiate));
router.get('/visas/:id', requirePermission(PERMISSIONS.VISA_READ), validate({ params: V.idParam }), asyncHandler(visa.getOne));
router.post('/visas/:id/transition', requirePermission(PERMISSIONS.VISA_APPROVE), validate({ params: V.idParam, body: V.visaTransition }), asyncHandler(visa.transition));
router.post('/visas/:id/renew', requirePermission(PERMISSIONS.VISA_WRITE), validate({ params: V.idParam }), asyncHandler(visa.renew));
router.post('/visas/:id/documents', requirePermission(PERMISSIONS.VISA_WRITE), validate({ params: V.idParam, body: V.visaDocument }), asyncHandler(visa.addDocument));
router.delete('/visas/:id', requirePermission(PERMISSIONS.VISA_WRITE), validate({ params: V.idParam }), asyncHandler(visa.remove));

// Relocations
router.get('/relocations', requirePermission(PERMISSIONS.RELOCATION_READ), asyncHandler(relocation.list));
router.post('/relocations', requirePermission(PERMISSIONS.RELOCATION_WRITE), validate({ body: V.requestRelocation }), asyncHandler(relocation.request));
router.get('/relocations/:id', requirePermission(PERMISSIONS.RELOCATION_READ), validate({ params: V.idParam }), asyncHandler(relocation.getOne));
router.post('/relocations/:id/approve', requirePermission(PERMISSIONS.RELOCATION_APPROVE), validate({ params: V.idParam, body: V.approveRelocation }), asyncHandler(relocation.approve));
router.post('/relocations/:id/transition', requirePermission(PERMISSIONS.RELOCATION_WRITE), validate({ params: V.idParam, body: V.relocationTransition }), asyncHandler(relocation.transition));
router.post('/relocations/:id/expenses', requirePermission(PERMISSIONS.RELOCATION_WRITE), validate({ params: V.idParam, body: V.relocationExpense }), asyncHandler(relocation.addExpense));
router.patch('/relocations/:id/expenses/:expenseId/review', requirePermission(PERMISSIONS.RELOCATION_APPROVE), validate({ params: V.idAndExpenseParams, body: V.reviewExpense }), asyncHandler(relocation.reviewExpense));

// Immigration cases
router.get('/immigration-cases', requirePermission(PERMISSIONS.IMMIGRATION_READ), asyncHandler(immigration.list));
router.post('/immigration-cases', requirePermission(PERMISSIONS.IMMIGRATION_WRITE), validate({ body: V.createImmigration }), asyncHandler(immigration.create));
router.get('/immigration-cases/:id', requirePermission(PERMISSIONS.IMMIGRATION_READ), validate({ params: V.idParam }), asyncHandler(immigration.getOne));
router.patch('/immigration-cases/:id', requirePermission(PERMISSIONS.IMMIGRATION_WRITE), validate({ params: V.idParam, body: V.updateImmigration }), asyncHandler(immigration.update));
router.post('/immigration-cases/:id/resolve', requirePermission(PERMISSIONS.IMMIGRATION_WRITE), validate({ params: V.idParam, body: V.resolveImmigration }), asyncHandler(immigration.resolve));
router.delete('/immigration-cases/:id', requirePermission(PERMISSIONS.IMMIGRATION_WRITE), validate({ params: V.idParam }), asyncHandler(immigration.remove));

// Travel requests
router.get('/travel', requirePermission(PERMISSIONS.TRAVEL_READ), asyncHandler(travel.list));
router.post('/travel', requirePermission(PERMISSIONS.TRAVEL_WRITE), validate({ body: V.submitTravel }), asyncHandler(travel.submit));
router.get('/travel/:id', requirePermission(PERMISSIONS.TRAVEL_READ), validate({ params: V.idParam }), asyncHandler(travel.getOne));
router.post('/travel/:id/approve', requirePermission(PERMISSIONS.TRAVEL_APPROVE), validate({ params: V.idParam, body: V.travelNote }), asyncHandler(travel.approve));
router.post('/travel/:id/reject', requirePermission(PERMISSIONS.TRAVEL_APPROVE), validate({ params: V.idParam, body: V.travelNote }), asyncHandler(travel.reject));
router.post('/travel/:id/book', requirePermission(PERMISSIONS.TRAVEL_WRITE), validate({ params: V.idParam, body: V.bookTravel }), asyncHandler(travel.book));
router.post('/travel/:id/complete', requirePermission(PERMISSIONS.TRAVEL_WRITE), validate({ params: V.idParam }), asyncHandler(travel.complete));
router.post('/travel/:id/cancel', requirePermission(PERMISSIONS.TRAVEL_WRITE), validate({ params: V.idParam }), asyncHandler(travel.cancel));

// Dashboard
router.get('/dashboard/overview', requirePermission(PERMISSIONS.VISA_READ), asyncHandler(dashboard.overview));

module.exports = router;
