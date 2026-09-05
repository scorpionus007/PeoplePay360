'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/payrollValidators');

const salaryStructure = require('../controllers/salaryStructureController');
const salaryRule = require('../controllers/salaryRuleController');
const contract = require('../controllers/contractController');
const payrun = require('../controllers/payrunController');
const payslip = require('../controllers/payslipController');
const salaryChange = require('../controllers/salaryChangeController');
const advance = require('../controllers/advanceSalaryController');
const bonus = require('../controllers/bonusController');
const paymentMethod = require('../controllers/paymentMethodController');
const dashboard = require('../controllers/dashboardController');

const router = express.Router();
router.use(requireAuth);

// Salary structures
router.get(
  '/salary-structures',
  requireAnyPermission(PERMISSIONS.PAYROLL_STRUCTURE_READ, PERMISSIONS.PAYROLL_READ),
  asyncHandler(salaryStructure.list)
);
router.post(
  '/salary-structures',
  requirePermission(PERMISSIONS.PAYROLL_STRUCTURE_WRITE),
  validate({ body: V.createSalaryStructure }),
  asyncHandler(salaryStructure.create)
);
router.get(
  '/salary-structures/:id',
  requireAnyPermission(PERMISSIONS.PAYROLL_STRUCTURE_READ, PERMISSIONS.PAYROLL_READ),
  validate({ params: V.idParam }),
  asyncHandler(salaryStructure.getOne)
);
router.patch(
  '/salary-structures/:id',
  requirePermission(PERMISSIONS.PAYROLL_STRUCTURE_WRITE),
  validate({ params: V.idParam, body: V.updateSalaryStructure }),
  asyncHandler(salaryStructure.update)
);
router.delete(
  '/salary-structures/:id',
  requirePermission(PERMISSIONS.PAYROLL_STRUCTURE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(salaryStructure.remove)
);
router.put(
  '/salary-structures/:id/rules',
  requirePermission(PERMISSIONS.PAYROLL_STRUCTURE_WRITE),
  validate({ params: V.idParam, body: V.setStructureRules }),
  asyncHandler(salaryStructure.setRules)
);

// Salary rules
router.get(
  '/salary-rules',
  requireAnyPermission(PERMISSIONS.PAYROLL_RULE_READ, PERMISSIONS.PAYROLL_READ),
  asyncHandler(salaryRule.list)
);
router.post(
  '/salary-rules',
  requirePermission(PERMISSIONS.PAYROLL_RULE_WRITE),
  validate({ body: V.createSalaryRule }),
  asyncHandler(salaryRule.create)
);
router.get(
  '/salary-rules/:id',
  requireAnyPermission(PERMISSIONS.PAYROLL_RULE_READ, PERMISSIONS.PAYROLL_READ),
  validate({ params: V.idParam }),
  asyncHandler(salaryRule.getOne)
);
router.patch(
  '/salary-rules/:id',
  requirePermission(PERMISSIONS.PAYROLL_RULE_WRITE),
  validate({ params: V.idParam, body: V.updateSalaryRule }),
  asyncHandler(salaryRule.update)
);
router.delete(
  '/salary-rules/:id',
  requirePermission(PERMISSIONS.PAYROLL_RULE_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(salaryRule.remove)
);

// Contracts
router.get(
  '/contracts',
  requirePermission(PERMISSIONS.CONTRACT_READ),
  asyncHandler(contract.list)
);
router.post(
  '/contracts',
  requirePermission(PERMISSIONS.CONTRACT_WRITE),
  validate({ body: V.createContract }),
  asyncHandler(contract.create)
);
router.get(
  '/contracts/:id',
  requirePermission(PERMISSIONS.CONTRACT_READ),
  validate({ params: V.idParam }),
  asyncHandler(contract.getOne)
);
router.patch(
  '/contracts/:id',
  requirePermission(PERMISSIONS.CONTRACT_WRITE),
  validate({ params: V.idParam, body: V.updateContract }),
  asyncHandler(contract.update)
);
router.post(
  '/contracts/:id/activate',
  requirePermission(PERMISSIONS.CONTRACT_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(contract.activate)
);
router.post(
  '/contracts/:id/terminate',
  requirePermission(PERMISSIONS.CONTRACT_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(contract.terminate)
);
router.delete(
  '/contracts/:id',
  requirePermission(PERMISSIONS.CONTRACT_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(contract.remove)
);

// Payruns
router.get('/payruns', requirePermission(PERMISSIONS.PAYRUN_READ), asyncHandler(payrun.list));
router.get(
  '/payruns/eligible-employees',
  requirePermission(PERMISSIONS.PAYRUN_READ),
  asyncHandler(payrun.eligibleEmployees)
);
router.post(
  '/payruns',
  requirePermission(PERMISSIONS.PAYRUN_WRITE),
  validate({ body: V.createPayrun }),
  asyncHandler(payrun.create)
);
router.get(
  '/payruns/:id',
  requirePermission(PERMISSIONS.PAYRUN_READ),
  validate({ params: V.idParam }),
  asyncHandler(payrun.getOne)
);
router.post(
  '/payruns/:id/compute',
  requirePermission(PERMISSIONS.PAYRUN_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(payrun.compute)
);
router.post(
  '/payruns/:id/validate',
  requirePermission(PERMISSIONS.PAYRUN_VALIDATE),
  validate({ params: V.idParam }),
  asyncHandler(payrun.validate)
);
router.post(
  '/payruns/:id/mark-paid',
  requirePermission(PERMISSIONS.PAYMENT_RELEASE),
  validate({ params: V.idParam }),
  asyncHandler(payrun.markPaid)
);
router.post(
  '/payruns/:id/cancel',
  requirePermission(PERMISSIONS.PAYRUN_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(payrun.cancel)
);
router.delete(
  '/payruns/:id',
  requirePermission(PERMISSIONS.PAYRUN_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(payrun.remove)
);

// Payslips
router.get('/payslips', requirePermission(PERMISSIONS.PAYSLIP_READ), asyncHandler(payslip.list));
router.get(
  '/payslips/:id',
  requirePermission(PERMISSIONS.PAYSLIP_READ),
  validate({ params: V.idParam }),
  asyncHandler(payslip.getOne)
);
router.get(
  '/payslips/:id/pdf',
  requirePermission(PERMISSIONS.PAYSLIP_READ),
  validate({ params: V.idParam }),
  asyncHandler(payslip.downloadPdf)
);
router.post(
  '/payslips/:id/mark-sent',
  requirePermission(PERMISSIONS.PAYSLIP_WRITE),
  validate({ params: V.idParam }),
  asyncHandler(payslip.markSent)
);

// Salary change requests
router.get(
  '/salary-change-requests',
  requireAnyPermission(
    PERMISSIONS.SALARY_CHANGE_SUGGEST,
    PERMISSIONS.SALARY_CHANGE_DECIDE,
    PERMISSIONS.SALARY_CHANGE_APPROVE
  ),
  asyncHandler(salaryChange.list)
);
router.post(
  '/salary-change-requests/suggest',
  requirePermission(PERMISSIONS.SALARY_CHANGE_SUGGEST),
  validate({ body: V.suggestSalaryChange }),
  asyncHandler(salaryChange.suggest)
);
router.get(
  '/salary-change-requests/:id',
  requireAnyPermission(
    PERMISSIONS.SALARY_CHANGE_SUGGEST,
    PERMISSIONS.SALARY_CHANGE_DECIDE,
    PERMISSIONS.SALARY_CHANGE_APPROVE
  ),
  validate({ params: V.idParam }),
  asyncHandler(salaryChange.getOne)
);
router.post(
  '/salary-change-requests/:id/payroll-decision',
  requirePermission(PERMISSIONS.SALARY_CHANGE_DECIDE),
  validate({ params: V.idParam, body: V.payrollDecideSalaryChange }),
  asyncHandler(salaryChange.payrollDecide)
);
router.post(
  '/salary-change-requests/:id/admin-approve',
  requirePermission(PERMISSIONS.SALARY_CHANGE_APPROVE),
  validate({ params: V.idParam, body: V.adminApproveSalaryChange }),
  asyncHandler(salaryChange.adminApprove)
);
router.post(
  '/salary-change-requests/:id/reject',
  requirePermission(PERMISSIONS.SALARY_CHANGE_APPROVE),
  validate({ params: V.idParam, body: V.rejectSalaryChange }),
  asyncHandler(salaryChange.reject)
);
router.post(
  '/salary-change-requests/:id/apply',
  requirePermission(PERMISSIONS.SALARY_CHANGE_APPROVE),
  validate({ params: V.idParam }),
  asyncHandler(salaryChange.apply)
);

// Advance salary
router.get(
  '/advance-salary-requests',
  requireAnyPermission(PERMISSIONS.ADVANCE_SALARY_REQUEST, PERMISSIONS.ADVANCE_SALARY_APPROVE),
  asyncHandler(advance.list)
);
router.post(
  '/advance-salary-requests',
  requirePermission(PERMISSIONS.ADVANCE_SALARY_REQUEST),
  validate({ body: V.requestAdvanceSalary }),
  asyncHandler(advance.request)
);
router.get(
  '/advance-salary-requests/:id',
  requireAnyPermission(PERMISSIONS.ADVANCE_SALARY_REQUEST, PERMISSIONS.ADVANCE_SALARY_APPROVE),
  validate({ params: V.idParam }),
  asyncHandler(advance.getOne)
);
router.post(
  '/advance-salary-requests/:id/approve',
  requirePermission(PERMISSIONS.ADVANCE_SALARY_APPROVE),
  validate({ params: V.idParam, body: V.approveAdvanceSalary }),
  asyncHandler(advance.approve)
);
router.post(
  '/advance-salary-requests/:id/reject',
  requirePermission(PERMISSIONS.ADVANCE_SALARY_APPROVE),
  validate({ params: V.idParam }),
  asyncHandler(advance.reject)
);
router.post(
  '/advance-salary-requests/:id/disburse',
  requirePermission(PERMISSIONS.PAYMENT_RELEASE),
  validate({ params: V.idParam }),
  asyncHandler(advance.disburse)
);
router.post(
  '/advance-salary-requests/:id/repayments',
  requirePermission(PERMISSIONS.ADVANCE_SALARY_APPROVE),
  validate({ params: V.idParam, body: V.recordAdvanceRepayment }),
  asyncHandler(advance.recordRepayment)
);
router.post(
  '/advance-salary-requests/:id/convert-to-emi',
  requirePermission(PERMISSIONS.ADVANCE_SALARY_APPROVE),
  validate({ params: V.idParam, body: V.convertAdvanceToEmi }),
  asyncHandler(advance.convertToEmi)
);

// Bonuses
router.get(
  '/bonuses',
  requireAnyPermission(PERMISSIONS.BONUS_MANAGE, PERMISSIONS.PAYROLL_READ),
  asyncHandler(bonus.list)
);
router.post(
  '/bonuses',
  requirePermission(PERMISSIONS.BONUS_MANAGE),
  validate({ body: V.createBonus }),
  asyncHandler(bonus.create)
);
router.post(
  '/bonuses/:id/approve',
  requirePermission(PERMISSIONS.BONUS_MANAGE),
  validate({ params: V.idParam }),
  asyncHandler(bonus.approve)
);
router.post(
  '/bonuses/:id/cancel',
  requirePermission(PERMISSIONS.BONUS_MANAGE),
  validate({ params: V.idParam }),
  asyncHandler(bonus.cancel)
);
router.delete(
  '/bonuses/:id',
  requirePermission(PERMISSIONS.BONUS_MANAGE),
  validate({ params: V.idParam }),
  asyncHandler(bonus.remove)
);

// Payment methods (nested under employees)
router.get(
  '/employees/:employeeId/payment-methods',
  requirePermission(PERMISSIONS.PAYROLL_READ),
  validate({ params: V.employeeIdParam }),
  asyncHandler(paymentMethod.listForEmployee)
);
router.post(
  '/employees/:employeeId/payment-methods',
  requirePermission(PERMISSIONS.PAYROLL_WRITE),
  validate({ params: V.employeeIdParam, body: V.createPaymentMethod }),
  asyncHandler(paymentMethod.create)
);
router.patch(
  '/employees/:employeeId/payment-methods/:id',
  requirePermission(PERMISSIONS.PAYROLL_WRITE),
  validate({ params: V.employeeAndIdParams, body: V.updatePaymentMethod }),
  asyncHandler(paymentMethod.update)
);
router.delete(
  '/employees/:employeeId/payment-methods/:id',
  requirePermission(PERMISSIONS.PAYROLL_WRITE),
  validate({ params: V.employeeAndIdParams }),
  asyncHandler(paymentMethod.remove)
);

// Dashboard
router.get('/dashboard/overview', requirePermission(PERMISSIONS.PAYROLL_READ), asyncHandler(dashboard.overview));

module.exports = router;
