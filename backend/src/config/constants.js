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

  // HR: Working Schedules
  WORKING_SCHEDULE_READ: 'working_schedule.read',
  WORKING_SCHEDULE_WRITE: 'working_schedule.write',

  // HR: Attendance
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_WRITE: 'attendance.write',
  ATTENDANCE_SELF_WRITE: 'attendance.self.write',
  ATTENDANCE_CORRECT: 'attendance.correct',

  // HR: Time Off
  TIME_OFF_TYPE_READ: 'timeoff.type.read',
  TIME_OFF_TYPE_WRITE: 'timeoff.type.write',
  TIME_OFF_ALLOCATION_READ: 'timeoff.allocation.read',
  TIME_OFF_ALLOCATION_WRITE: 'timeoff.allocation.write',
  TIME_OFF_ALLOCATION_APPROVE: 'timeoff.allocation.approve',
  TIME_OFF_REQUEST_READ: 'timeoff.request.read',
  TIME_OFF_REQUEST_WRITE: 'timeoff.request.write',
  TIME_OFF_REQUEST_APPROVE: 'timeoff.request.approve',

  // HR: Employee services, feedback, chat
  FEEDBACK_READ: 'feedback.read',
  FEEDBACK_WRITE: 'feedback.write',
  HR_REQUEST_READ: 'hr.request.read',
  HR_REQUEST_WRITE: 'hr.request.write',
  HR_CHAT_READ: 'hr.chat.read',
  HR_CHAT_WRITE: 'hr.chat.write',

  // IT Administration
  IT_DEVICE_READ: 'it.device.read',
  IT_DEVICE_WRITE: 'it.device.write',
  IT_DEVICE_ASSIGN: 'it.device.assign',
  IT_SOFTWARE_READ: 'it.software.read',
  IT_SOFTWARE_WRITE: 'it.software.write',
  IT_BASELINE_READ: 'it.baseline.read',
  IT_BASELINE_WRITE: 'it.baseline.write',
  IT_EDR_READ: 'it.edr.read',
  IT_EDR_WRITE: 'it.edr.write',
  IT_ONBOARDING_READ: 'it.onboarding.read',
  IT_ONBOARDING_WRITE: 'it.onboarding.write',
  IT_LEASE_READ: 'it.lease.read',
  IT_LEASE_WRITE: 'it.lease.write',

  // Benefits
  BENEFIT_PROVIDER_READ: 'benefit.provider.read',
  BENEFIT_PROVIDER_WRITE: 'benefit.provider.write',
  BENEFIT_PLAN_READ: 'benefit.plan.read',
  BENEFIT_PLAN_WRITE: 'benefit.plan.write',
  BENEFIT_ENROLLMENT_READ: 'benefit.enrollment.read',
  BENEFIT_ENROLLMENT_WRITE: 'benefit.enrollment.write',
  BENEFIT_ENROLLMENT_APPROVE: 'benefit.enrollment.approve',
  BENEFIT_CLAIM_READ: 'benefit.claim.read',
  BENEFIT_CLAIM_WRITE: 'benefit.claim.write',
  BENEFIT_CLAIM_APPROVE: 'benefit.claim.approve',
  LOAN_PROGRAM_READ: 'loan.program.read',
  LOAN_PROGRAM_WRITE: 'loan.program.write',
  LOAN_REQUEST_READ: 'loan.request.read',
  LOAN_REQUEST_WRITE: 'loan.request.write',
  LOAN_APPROVE: 'loan.approve',
  LOAN_DISBURSE: 'loan.disburse',
  VOUCHER_READ: 'voucher.read',
  VOUCHER_WRITE: 'voucher.write',
  DISCOUNT_PARTNER_READ: 'discount.partner.read',
  DISCOUNT_PARTNER_WRITE: 'discount.partner.write',

  // Hiring
  REQUISITION_READ: 'requisition.read',
  REQUISITION_WRITE: 'requisition.write',
  REQUISITION_APPROVE: 'requisition.approve',
  JOB_POSTING_READ: 'job.posting.read',
  JOB_POSTING_WRITE: 'job.posting.write',
  JOB_POSTING_PUBLISH: 'job.posting.publish',
  JOB_BOARD_READ: 'job.board.read',
  JOB_BOARD_WRITE: 'job.board.write',
  CANDIDATE_READ: 'candidate.read',
  CANDIDATE_WRITE: 'candidate.write',
  APPLICATION_READ: 'application.read',
  APPLICATION_WRITE: 'application.write',
  APPLICATION_PROGRESS: 'application.progress',
  INTERVIEW_READ: 'interview.read',
  INTERVIEW_WRITE: 'interview.write',
  INTERVIEW_FEEDBACK_WRITE: 'interview.feedback.write',
  OFFER_READ: 'offer.read',
  OFFER_WRITE: 'offer.write',
  OFFER_APPROVE: 'offer.approve',
  REFERRAL_READ: 'referral.read',
  REFERRAL_WRITE: 'referral.write',
  REFERRAL_SUBMIT: 'referral.submit',

  // Mobility
  LOCATION_STANDARD_READ: 'location.standard.read',
  LOCATION_STANDARD_WRITE: 'location.standard.write',
  VISA_READ: 'visa.read',
  VISA_WRITE: 'visa.write',
  VISA_APPROVE: 'visa.approve',
  RELOCATION_READ: 'relocation.read',
  RELOCATION_WRITE: 'relocation.write',
  RELOCATION_APPROVE: 'relocation.approve',
  IMMIGRATION_READ: 'immigration.read',
  IMMIGRATION_WRITE: 'immigration.write',
  TRAVEL_READ: 'travel.read',
  TRAVEL_WRITE: 'travel.write',
  TRAVEL_APPROVE: 'travel.approve',
  MOBILITY_PARTNER_READ: 'mobility.partner.read',
  MOBILITY_PARTNER_WRITE: 'mobility.partner.write',
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

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  LATE: 'late',
  EARLY_LEAVE: 'early_leave',
  ABSENT: 'absent',
  ON_LEAVE: 'on_leave',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
  OVERTIME: 'overtime',
  MISSING_CHECKOUT: 'missing_checkout',
});

const TIME_OFF_UNIT = Object.freeze({
  DAYS: 'days',
  HOURS: 'hours',
});

const TIME_OFF_REQUEST_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REFUSED: 'refused',
  CANCELLED: 'cancelled',
});

const TIME_OFF_ALLOCATION_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REFUSED: 'refused',
  EXPIRED: 'expired',
});

const FEEDBACK_CATEGORY = Object.freeze({
  APPRECIATION: 'appreciation',
  COMPLAINT: 'complaint',
  SUGGESTION: 'suggestion',
  HARASSMENT: 'harassment',
  SAFETY: 'safety',
  POLICY: 'policy',
  MANAGER: 'manager',
  PEER: 'peer',
  OTHER: 'other',
});

const FEEDBACK_STATUS = Object.freeze({
  NEW: 'new',
  UNDER_REVIEW: 'under_review',
  ACTION_TAKEN: 'action_taken',
  ESCALATED: 'escalated',
  CLOSED: 'closed',
});

const HR_REQUEST_TYPE = Object.freeze({
  DOCUMENT: 'document',
  LETTER: 'letter',
  POLICY_QUERY: 'policy_query',
  SALARY_QUERY: 'salary_query',
  IT_QUERY: 'it_query',
  BENEFITS_QUERY: 'benefits_query',
  GENERAL: 'general',
});

const HR_REQUEST_STATUS = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_ON_EMPLOYEE: 'waiting_on_employee',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
});

const BENEFIT_CATEGORY = Object.freeze({
  HEALTH_INSURANCE: 'health_insurance',
  DENTAL_INSURANCE: 'dental_insurance',
  VISION_INSURANCE: 'vision_insurance',
  LIFE_INSURANCE: 'life_insurance',
  DISABILITY_INSURANCE: 'disability_insurance',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  LEGAL_SUPPORT: 'legal_support',
  WELLNESS: 'wellness',
  MENTAL_HEALTH: 'mental_health',
  TRANSPORTATION: 'transportation',
  MEALS: 'meals',
  GIFT_VOUCHER: 'gift_voucher',
  SHOPPING_DISCOUNT: 'shopping_discount',
  RETIREMENT: 'retirement',
  LOAN: 'loan',
  LEARNING: 'learning',
  RELOCATION: 'relocation',
  CHILDCARE: 'childcare',
  OTHER: 'other',
});

const BENEFIT_PLAN_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
});

const BENEFIT_ENROLLMENT_STATUS = Object.freeze({
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  WAIVED: 'waived',
  TERMINATED: 'terminated',
  DECLINED: 'declined',
});

const BENEFIT_CLAIM_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REIMBURSED: 'reimbursed',
  CANCELLED: 'cancelled',
});

const DEPENDENT_RELATION = Object.freeze({
  SPOUSE: 'spouse',
  CHILD: 'child',
  PARENT: 'parent',
  SIBLING: 'sibling',
  DOMESTIC_PARTNER: 'domestic_partner',
  OTHER: 'other',
});

const LOAN_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISBURSED: 'disbursed',
  REPAYING: 'repaying',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
});

const LOAN_INTEREST_MODE = Object.freeze({
  ZERO: 'zero',
  FLAT: 'flat',
  REDUCING_BALANCE: 'reducing_balance',
});

const VOUCHER_STATUS = Object.freeze({
  ISSUED: 'issued',
  DELIVERED: 'delivered',
  REDEEMED: 'redeemed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

const VISA_TYPE = Object.freeze({
  WORK_VISA: 'work_visa',
  BUSINESS_VISA: 'business_visa',
  DEPENDENT_VISA: 'dependent_visa',
  PERMANENT_RESIDENCY: 'permanent_residency',
  STUDENT_VISA: 'student_visa',
  TRANSIT: 'transit',
  DIGITAL_NOMAD: 'digital_nomad',
  OTHER: 'other',
});

const VISA_STATUS = Object.freeze({
  INITIATED: 'initiated',
  DOCUMENTS_COLLECTING: 'documents_collecting',
  UNDER_INTERNAL_REVIEW: 'under_internal_review',
  FILED: 'filed',
  RFE_PENDING: 'rfe_pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  EXPIRED: 'expired',
  RENEWED: 'renewed',
  CANCELLED: 'cancelled',
});

const RELOCATION_STATUS = Object.freeze({
  REQUESTED: 'requested',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const RELOCATION_BUDGET_STATUS = Object.freeze({
  DRAFT: 'draft',
  APPROVED: 'approved',
  EXHAUSTED: 'exhausted',
  CLOSED: 'closed',
});

const IMMIGRATION_CASE_TYPE = Object.freeze({
  WORK_VISA: 'work_visa',
  PERMANENT_RESIDENCY: 'permanent_residency',
  FAMILY_SPONSORSHIP: 'family_sponsorship',
  CITIZENSHIP: 'citizenship',
  RENEWAL: 'renewal',
  APPEAL: 'appeal',
});

const IMMIGRATION_CASE_STATUS = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
});

const TRAVEL_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BOOKED: 'booked',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const MOBILITY_PARTNER_CATEGORY = Object.freeze({
  IMMIGRATION_LAWYER: 'immigration_lawyer',
  RELOCATION_AGENCY: 'relocation_agency',
  TAX_CONSULTANT: 'tax_consultant',
  HOUSING: 'housing',
  INSURANCE: 'insurance',
  LANGUAGE_TRAINING: 'language_training',
  TRAVEL_AGENCY: 'travel_agency',
  OTHER: 'other',
});

const REQUISITION_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  ON_HOLD: 'on_hold',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
});

const JOB_POSTING_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PAUSED: 'paused',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
});

const HIRING_TRACK = Object.freeze({
  INTERNAL: 'internal',
  EXTERNAL: 'external',
  INTERN: 'intern',
  FREELANCER: 'freelancer',
  AUDITOR: 'auditor',
});

const APPLICATION_STAGE = Object.freeze({
  APPLIED: 'applied',
  SCREENING: 'screening',
  PHONE_SCREEN: 'phone_screen',
  ASSESSMENT: 'assessment',
  INTERVIEW: 'interview',
  ONSITE: 'onsite',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  ON_HOLD: 'on_hold',
});

const APPLICATION_SOURCE = Object.freeze({
  DIRECT: 'direct',
  REFERRAL: 'referral',
  JOB_BOARD: 'job_board',
  AGENCY: 'agency',
  SOURCED: 'sourced',
  INTERNAL: 'internal',
  UNIVERSITY: 'university',
});

const INTERVIEW_TYPE = Object.freeze({
  PHONE: 'phone',
  VIDEO: 'video',
  ONSITE: 'onsite',
  TECHNICAL: 'technical',
  PANEL: 'panel',
  BEHAVIORAL: 'behavioral',
  CULTURE: 'culture',
  TAKE_HOME: 'take_home',
});

const INTERVIEW_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
});

const INTERVIEW_RECOMMENDATION = Object.freeze({
  STRONG_HIRE: 'strong_hire',
  HIRE: 'hire',
  NO_HIRE: 'no_hire',
  STRONG_NO_HIRE: 'strong_no_hire',
  NEEDS_ANOTHER_ROUND: 'needs_another_round',
});

const OFFER_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  EXTENDED: 'extended',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  RESCINDED: 'rescinded',
  EXPIRED: 'expired',
});

const REFERRAL_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  ADVANCED: 'advanced',
  HIRED: 'hired',
  REJECTED: 'rejected',
  BONUS_PAID: 'bonus_paid',
  CANCELLED: 'cancelled',
});

const DEVICE_STATUS = Object.freeze({
  IN_STOCK: 'in_stock',
  ASSIGNED: 'assigned',
  IN_REPAIR: 'in_repair',
  RETIRED: 'retired',
  LOST: 'lost',
  QUARANTINED: 'quarantined',
});

const DEVICE_OWNERSHIP = Object.freeze({
  OWNED: 'owned',
  LEASED: 'leased',
  BYOD: 'byod',
});

const DEVICE_CATEGORY = Object.freeze({
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  MONITOR: 'monitor',
  ACCESSORY: 'accessory',
  SERVER: 'server',
});

const OS_FAMILY = Object.freeze({
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  IOS: 'ios',
  ANDROID: 'android',
  CHROMEOS: 'chromeos',
  OTHER: 'other',
});

const BASELINE_STATUS = Object.freeze({
  PASS: 'pass',
  FAIL: 'fail',
  WARN: 'warn',
  SKIP: 'skip',
  UNKNOWN: 'unknown',
});

const BASELINE_CATEGORY = Object.freeze({
  PATCH: 'patch',
  ENCRYPTION: 'encryption',
  MFA: 'mfa',
  ANTIVIRUS: 'antivirus',
  EDR: 'edr',
  FIREWALL: 'firewall',
  BACKUP: 'backup',
  PASSWORD_POLICY: 'password_policy',
  ACCESS_CONTROL: 'access_control',
  OS_CONFIG: 'os_config',
});

const EDR_VENDOR = Object.freeze({
  CROWDSTRIKE: 'crowdstrike',
  SENTINELONE: 'sentinelone',
  MICROSOFT_DEFENDER: 'microsoft_defender',
  SOPHOS: 'sophos',
  CARBON_BLACK: 'carbon_black',
  ELASTIC: 'elastic',
  CUSTOM: 'custom',
});

const EDR_EVENT_SEVERITY = Object.freeze({
  INFO: 'info',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const ONBOARDING_PROVISION_STATUS = Object.freeze({
  REQUESTED: 'requested',
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  ACTIVATED: 'activated',
  CANCELLED: 'cancelled',
});

const SOFTWARE_LICENSE_TYPE = Object.freeze({
  PER_USER: 'per_user',
  PER_DEVICE: 'per_device',
  SITE: 'site',
  SUBSCRIPTION: 'subscription',
  PERPETUAL: 'perpetual',
  FREE: 'free',
});

const DEVICE_SOFTWARE_STATUS = Object.freeze({
  INSTALLED: 'installed',
  PENDING: 'pending',
  UNINSTALLED: 'uninstalled',
  FAILED: 'failed',
});

const CHAT_SENDER_TYPE = Object.freeze({
  EMPLOYEE: 'employee',
  HR: 'hr',
  HR_MANAGER: 'hr_manager',
  DEPT_LEAD: 'dept_lead',
  AI_BOT: 'ai_bot',
  SYSTEM: 'system',
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
  ATTENDANCE_STATUS,
  TIME_OFF_UNIT,
  TIME_OFF_REQUEST_STATUS,
  TIME_OFF_ALLOCATION_STATUS,
  FEEDBACK_CATEGORY,
  FEEDBACK_STATUS,
  HR_REQUEST_TYPE,
  HR_REQUEST_STATUS,
  CHAT_SENDER_TYPE,
  DEVICE_STATUS,
  DEVICE_OWNERSHIP,
  DEVICE_CATEGORY,
  OS_FAMILY,
  BASELINE_STATUS,
  BASELINE_CATEGORY,
  EDR_VENDOR,
  EDR_EVENT_SEVERITY,
  ONBOARDING_PROVISION_STATUS,
  SOFTWARE_LICENSE_TYPE,
  DEVICE_SOFTWARE_STATUS,
  BENEFIT_CATEGORY,
  BENEFIT_PLAN_STATUS,
  BENEFIT_ENROLLMENT_STATUS,
  BENEFIT_CLAIM_STATUS,
  DEPENDENT_RELATION,
  LOAN_STATUS,
  LOAN_INTEREST_MODE,
  VOUCHER_STATUS,
  REQUISITION_STATUS,
  JOB_POSTING_STATUS,
  HIRING_TRACK,
  APPLICATION_STAGE,
  APPLICATION_SOURCE,
  INTERVIEW_TYPE,
  INTERVIEW_STATUS,
  INTERVIEW_RECOMMENDATION,
  OFFER_STATUS,
  REFERRAL_STATUS,
  VISA_TYPE,
  VISA_STATUS,
  RELOCATION_STATUS,
  RELOCATION_BUDGET_STATUS,
  IMMIGRATION_CASE_TYPE,
  IMMIGRATION_CASE_STATUS,
  TRAVEL_STATUS,
  MOBILITY_PARTNER_CATEGORY,
};
