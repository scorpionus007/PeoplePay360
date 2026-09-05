'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/coreValidators');

const org = require('../controllers/organizationController');
const department = require('../controllers/departmentController');
const employee = require('../controllers/employeeController');

const router = express.Router();
router.use(requireAuth);

// Organization
router.get('/organizations/me', asyncHandler(org.getMine));
router.patch(
  '/organizations/me',
  requirePermission(PERMISSIONS.ORG_MANAGE),
  validate({ body: V.updateOrganization }),
  asyncHandler(org.update)
);

// Departments
router.get('/departments', requirePermission(PERMISSIONS.DEPARTMENT_READ), asyncHandler(department.list));
router.post(
  '/departments',
  requirePermission(PERMISSIONS.DEPARTMENT_WRITE),
  validate({ body: V.createDepartment }),
  asyncHandler(department.create)
);
router.get(
  '/departments/:id',
  requirePermission(PERMISSIONS.DEPARTMENT_READ),
  validate({ params: V.idParam }),
  asyncHandler(department.getOne)
);
router.patch(
  '/departments/:id',
  requirePermission(PERMISSIONS.DEPARTMENT_WRITE),
  validate({ params: V.idParam, body: V.updateDepartment }),
  asyncHandler(department.update)
);
router.delete(
  '/departments/:id',
  requirePermission(PERMISSIONS.DEPARTMENT_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(department.remove)
);

// Employees
router.get('/employees', requirePermission(PERMISSIONS.EMPLOYEE_READ), asyncHandler(employee.list));
router.post(
  '/employees',
  requirePermission(PERMISSIONS.EMPLOYEE_WRITE),
  validate({ body: V.createEmployee }),
  asyncHandler(employee.create)
);
router.get(
  '/employees/:id',
  requirePermission(PERMISSIONS.EMPLOYEE_READ),
  validate({ params: V.idParam }),
  asyncHandler(employee.getOne)
);
router.patch(
  '/employees/:id',
  requirePermission(PERMISSIONS.EMPLOYEE_WRITE),
  validate({ params: V.idParam, body: V.updateEmployee }),
  asyncHandler(employee.update)
);
router.delete(
  '/employees/:id',
  requirePermission(PERMISSIONS.EMPLOYEE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(employee.remove)
);

module.exports = router;
