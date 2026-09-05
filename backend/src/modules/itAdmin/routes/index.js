'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/itValidators');

const device = require('../controllers/deviceController');
const software = require('../controllers/softwareController');
const baseline = require('../controllers/baselineController');
const edr = require('../controllers/edrController');
const onboarding = require('../controllers/onboardingController');
const dashboard = require('../controllers/itDashboardController');

const router = express.Router();
router.use(requireAuth);

// Devices
router.get('/devices', requirePermission(PERMISSIONS.IT_DEVICE_READ), asyncHandler(device.list));
router.post(
  '/devices',
  requirePermission(PERMISSIONS.IT_DEVICE_WRITE),
  validate({ body: V.createDevice }),
  asyncHandler(device.create)
);
router.get('/devices/:id', requirePermission(PERMISSIONS.IT_DEVICE_READ), validate({ params: V.idParam }), asyncHandler(device.getOne));
router.patch(
  '/devices/:id',
  requirePermission(PERMISSIONS.IT_DEVICE_WRITE),
  validate({ params: V.idParam, body: V.updateDevice }),
  asyncHandler(device.update)
);
router.delete('/devices/:id', requirePermission(PERMISSIONS.IT_DEVICE_WRITE), validate({ params: V.idParam }), asyncHandler(device.remove));
router.post(
  '/devices/:id/assign',
  requirePermission(PERMISSIONS.IT_DEVICE_ASSIGN),
  validate({ params: V.idParam, body: V.assignDevice }),
  asyncHandler(device.assign)
);
router.post(
  '/devices/:id/unassign',
  requirePermission(PERMISSIONS.IT_DEVICE_ASSIGN),
  validate({ params: V.idParam, body: V.unassignDevice }),
  asyncHandler(device.unassign)
);

// Software catalog
router.get('/software', requirePermission(PERMISSIONS.IT_SOFTWARE_READ), asyncHandler(software.listCatalog));
router.post(
  '/software',
  requirePermission(PERMISSIONS.IT_SOFTWARE_WRITE),
  validate({ body: V.createSoftwareItem }),
  asyncHandler(software.createCatalogItem)
);
router.get(
  '/software/:id',
  requirePermission(PERMISSIONS.IT_SOFTWARE_READ),
  validate({ params: V.idParam }),
  asyncHandler(software.getCatalogItem)
);
router.patch(
  '/software/:id',
  requirePermission(PERMISSIONS.IT_SOFTWARE_WRITE),
  validate({ params: V.idParam, body: V.updateSoftwareItem }),
  asyncHandler(software.updateCatalogItem)
);
router.delete(
  '/software/:id',
  requirePermission(PERMISSIONS.IT_SOFTWARE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(software.removeCatalogItem)
);

// Device software installs
router.get(
  '/devices/:deviceId/software',
  requirePermission(PERMISSIONS.IT_DEVICE_READ),
  validate({ params: V.deviceIdParam }),
  asyncHandler(software.listForDevice)
);
router.post(
  '/devices/:deviceId/software',
  requirePermission(PERMISSIONS.IT_SOFTWARE_WRITE),
  validate({ params: V.deviceIdParam, body: V.assignSoftware }),
  asyncHandler(software.assignToDevice)
);
router.delete(
  '/devices/:deviceId/software/:id',
  requirePermission(PERMISSIONS.IT_SOFTWARE_WRITE),
  validate({ params: V.deviceAndIdParams }),
  asyncHandler(software.unassignFromDevice)
);

// Baseline controls
router.get('/baseline/controls', requirePermission(PERMISSIONS.IT_BASELINE_READ), asyncHandler(baseline.listControls));
router.post(
  '/baseline/controls',
  requirePermission(PERMISSIONS.IT_BASELINE_WRITE),
  validate({ body: V.createBaselineControl }),
  asyncHandler(baseline.createControl)
);
router.get(
  '/baseline/controls/:id',
  requirePermission(PERMISSIONS.IT_BASELINE_READ),
  validate({ params: V.idParam }),
  asyncHandler(baseline.getControl)
);
router.patch(
  '/baseline/controls/:id',
  requirePermission(PERMISSIONS.IT_BASELINE_WRITE),
  validate({ params: V.idParam, body: V.updateBaselineControl }),
  asyncHandler(baseline.updateControl)
);
router.delete(
  '/baseline/controls/:id',
  requirePermission(PERMISSIONS.IT_BASELINE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(baseline.removeControl)
);
router.post(
  '/devices/:deviceId/baseline-checks',
  requirePermission(PERMISSIONS.IT_BASELINE_WRITE),
  validate({ params: V.deviceIdParam, body: V.reportBaselineCheck }),
  asyncHandler(baseline.reportCheck)
);
router.get(
  '/devices/:deviceId/baseline-posture',
  requirePermission(PERMISSIONS.IT_BASELINE_READ),
  validate({ params: V.deviceIdParam }),
  asyncHandler(baseline.devicePosture)
);
router.get('/baseline/posture', requirePermission(PERMISSIONS.IT_BASELINE_READ), asyncHandler(baseline.orgPosture));

// EDR
router.get('/edr/integrations', requirePermission(PERMISSIONS.IT_EDR_READ), asyncHandler(edr.listIntegrations));
router.post(
  '/edr/integrations',
  requirePermission(PERMISSIONS.IT_EDR_WRITE),
  validate({ body: V.createEdrIntegration }),
  asyncHandler(edr.createIntegration)
);
router.get(
  '/edr/integrations/:id',
  requirePermission(PERMISSIONS.IT_EDR_READ),
  validate({ params: V.idParam }),
  asyncHandler(edr.getIntegration)
);
router.patch(
  '/edr/integrations/:id',
  requirePermission(PERMISSIONS.IT_EDR_WRITE),
  validate({ params: V.idParam, body: V.updateEdrIntegration }),
  asyncHandler(edr.updateIntegration)
);
router.delete(
  '/edr/integrations/:id',
  requirePermission(PERMISSIONS.IT_EDR_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(edr.removeIntegration)
);
router.post(
  '/edr/integrations/:id/events',
  requirePermission(PERMISSIONS.IT_EDR_WRITE),
  validate({ params: V.idParam, body: V.ingestEdrEvent }),
  asyncHandler(edr.ingestEvent)
);
router.get('/edr/events', requirePermission(PERMISSIONS.IT_EDR_READ), asyncHandler(edr.listEvents));
router.patch(
  '/edr/integrations/:id/events/:eventId/status',
  requirePermission(PERMISSIONS.IT_EDR_WRITE),
  validate({ params: V.integrationAndEventParams, body: V.updateEdrEventStatus }),
  asyncHandler(edr.updateEventStatus)
);

// Onboarding
router.get('/onboarding/kits', requirePermission(PERMISSIONS.IT_ONBOARDING_READ), asyncHandler(onboarding.listKits));
router.post(
  '/onboarding/kits',
  requirePermission(PERMISSIONS.IT_ONBOARDING_WRITE),
  validate({ body: V.createOnboardingKit }),
  asyncHandler(onboarding.createKit)
);
router.get(
  '/onboarding/kits/:id',
  requirePermission(PERMISSIONS.IT_ONBOARDING_READ),
  validate({ params: V.idParam }),
  asyncHandler(onboarding.getKit)
);
router.patch(
  '/onboarding/kits/:id',
  requirePermission(PERMISSIONS.IT_ONBOARDING_WRITE),
  validate({ params: V.idParam, body: V.updateOnboardingKit }),
  asyncHandler(onboarding.updateKit)
);
router.delete(
  '/onboarding/kits/:id',
  requirePermission(PERMISSIONS.IT_ONBOARDING_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(onboarding.removeKit)
);
router.get('/onboarding/provisions', requirePermission(PERMISSIONS.IT_ONBOARDING_READ), asyncHandler(onboarding.listProvisions));
router.post(
  '/onboarding/provisions',
  requirePermission(PERMISSIONS.IT_ONBOARDING_WRITE),
  validate({ body: V.provisionOnboarding }),
  asyncHandler(onboarding.provision)
);
router.patch(
  '/onboarding/provisions/:id/status',
  requirePermission(PERMISSIONS.IT_ONBOARDING_WRITE),
  validate({ params: V.idParam, body: V.advanceProvisionStatus }),
  asyncHandler(onboarding.advanceStatus)
);

// Dashboard
router.get('/dashboard/overview', requirePermission(PERMISSIONS.IT_DEVICE_READ), asyncHandler(dashboard.overview));

module.exports = router;
