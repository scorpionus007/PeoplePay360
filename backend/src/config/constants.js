'use strict';

const ROLES = Object.freeze({
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  HR: 'hr',
  PAYROLL_MANAGER: 'payroll_manager',
  PAYROLL_USER: 'payroll_user',
  IT_ADMIN: 'it_admin',
  TALENT_ACQUISITION_LEAD: 'talent_acquisition_lead',
  EMPLOYEE: 'employee',
});

const PERMISSIONS = Object.freeze({
  // Core
  USER_MANAGE: 'user.manage',
  ORG_MANAGE: 'org.manage',
  EMPLOYEE_READ: 'employee.read',
  EMPLOYEE_WRITE: 'employee.write',
  DEPARTMENT_READ: 'department.read',
  DEPARTMENT_WRITE: 'department.write',

  // Payroll
  PAYROLL_READ: 'payroll.read',
  PAYROLL_WRITE: 'payroll.write',
  PAYROLL_STRUCTURE_READ: 'payroll.structure.read',
  PAYROLL_STRUCTURE_WRITE: 'payroll.structure.write',
  PAYROLL_RULE_READ: 'payroll.rule.read',
  PAYROLL_RULE_WRITE: 'payroll.rule.write',
  CONTRACT_READ: 'contract.read',
  CONTRACT_WRITE: 'contract.write',
  PAYRUN_READ: 'payrun.read',
  PAYRUN_WRITE: 'payrun.write',
  PAYRUN_VALIDATE: 'payrun.validate',
  PAYSLIP_READ: 'payslip.read',
  PAYSLIP_WRITE: 'payslip.write',
  PAYMENT_RELEASE: 'payment.release',
  SALARY_CHANGE_SUGGEST: 'salary.change.suggest',
  SALARY_CHANGE_DECIDE: 'salary.change.decide',
  SALARY_CHANGE_APPROVE: 'salary.change.approve',
  ADVANCE_SALARY_REQUEST: 'advance.salary.request',
  ADVANCE_SALARY_APPROVE: 'advance.salary.approve',
  BONUS_MANAGE: 'bonus.manage',
});

const EMPLOYMENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated',
  ONBOARDING: 'onboarding',
});

const EMPLOYEE_TYPE = Object.freeze({
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERN: 'intern',
  FREELANCER: 'freelancer',
  AUDITOR: 'auditor',
});

const CONTRACT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
});

const PAYRUN_STATUS = Object.freeze({
  DRAFT: 'draft',
  COMPUTED: 'computed',
  VALIDATED: 'validated',
  PAID: 'paid',
  CANCELLED: 'cancelled',
});

const PAYSLIP_STATUS = Object.freeze({
  DRAFT: 'draft',
  COMPUTED: 'computed',
  VALIDATED: 'validated',
  PAID: 'paid',
  CANCELLED: 'cancelled',
});

const SALARY_RULE_CATEGORY = Object.freeze({
  BASIC: 'basic',
  ALLOWANCE: 'allowance',
  GROSS: 'gross',
  DEDUCTION: 'deduction',
  TAX: 'tax',
  CONTRIBUTION: 'contribution',
  NET: 'net',
});

const SALARY_RULE_COMPUTE_TYPE = Object.freeze({
  FIXED: 'fixed',
  PERCENT_OF_BASIC: 'percent_of_basic',
  PERCENT_OF_CATEGORY: 'percent_of_category',
  PERCENT_OF_GROSS: 'percent_of_gross',
  FORMULA: 'formula',
});

const CHANGE_REQUEST_STATUS = Object.freeze({
  PENDING_PAYROLL_REVIEW: 'pending_payroll_review',
  PENDING_ADMIN_APPROVAL: 'pending_admin_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  APPLIED: 'applied',
  CANCELLED: 'cancelled',
});

const ADVANCE_SALARY_STATUS = Object.freeze({
  REQUESTED: 'requested',
  APPROVED: 'approved',
  DISBURSED: 'disbursed',
  RECOVERING: 'recovering',
  SETTLED: 'settled',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});

const ADVANCE_SALARY_REPAYMENT_MODE = Object.freeze({
  SALARY_DEDUCTION: 'salary_deduction',
  DIRECT_TRANSFER: 'direct_transfer',
  EMI: 'emi',
});

const PAYMENT_METHOD_TYPE = Object.freeze({
  BANK_TRANSFER: 'bank_transfer',
  WIRE: 'wire',
  ACH: 'ach',
  SEPA: 'sepa',
  UPI: 'upi',
  PAYPAL: 'paypal',
  CRYPTO: 'crypto',
});

const BONUS_TYPE = Object.freeze({
  PERFORMANCE: 'performance',
  RETENTION: 'retention',
  REFERRAL: 'referral',
  SIGN_ON: 'sign_on',
  FESTIVE: 'festive',
  DISCRETIONARY: 'discretionary',
});

module.exports = {
  ROLES,
  PERMISSIONS,
  EMPLOYMENT_STATUS,
  EMPLOYEE_TYPE,
  CONTRACT_STATUS,
  PAYRUN_STATUS,
  PAYSLIP_STATUS,
  SALARY_RULE_CATEGORY,
  SALARY_RULE_COMPUTE_TYPE,
  CHANGE_REQUEST_STATUS,
  ADVANCE_SALARY_STATUS,
  ADVANCE_SALARY_REPAYMENT_MODE,
  PAYMENT_METHOD_TYPE,
  BONUS_TYPE,
};
