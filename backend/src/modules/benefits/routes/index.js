'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/benefitsValidators');

const provider = require('../controllers/benefitProviderController');
const plan = require('../controllers/benefitPlanController');
const enrollment = require('../controllers/enrollmentController');
const claim = require('../controllers/claimController');
const loan = require('../controllers/loanController');
const voucher = require('../controllers/voucherController');
const discount = require('../controllers/discountPartnerController');
const dashboard = require('../controllers/benefitsDashboardController');

const router = express.Router();
router.use(requireAuth);

// Providers
router.get('/providers', requirePermission(PERMISSIONS.BENEFIT_PROVIDER_READ), asyncHandler(provider.list));
router.post('/providers', requirePermission(PERMISSIONS.BENEFIT_PROVIDER_WRITE), validate({ body: V.createProvider }), asyncHandler(provider.create));
router.get('/providers/:id', requirePermission(PERMISSIONS.BENEFIT_PROVIDER_READ), validate({ params: V.idParam }), asyncHandler(provider.getOne));
router.patch('/providers/:id', requirePermission(PERMISSIONS.BENEFIT_PROVIDER_WRITE), validate({ params: V.idParam, body: V.updateProvider }), asyncHandler(provider.update));
router.delete('/providers/:id', requirePermission(PERMISSIONS.BENEFIT_PROVIDER_WRITE), validate({ params: V.idParam }), asyncHandler(provider.remove));

// Plans
router.get('/plans', requirePermission(PERMISSIONS.BENEFIT_PLAN_READ), asyncHandler(plan.list));
router.post('/plans', requirePermission(PERMISSIONS.BENEFIT_PLAN_WRITE), validate({ body: V.createPlan }), asyncHandler(plan.create));
router.get('/plans/:id', requirePermission(PERMISSIONS.BENEFIT_PLAN_READ), validate({ params: V.idParam }), asyncHandler(plan.getOne));
router.patch('/plans/:id', requirePermission(PERMISSIONS.BENEFIT_PLAN_WRITE), validate({ params: V.idParam, body: V.updatePlan }), asyncHandler(plan.update));
router.delete('/plans/:id', requirePermission(PERMISSIONS.BENEFIT_PLAN_WRITE), validate({ params: V.idParam }), asyncHandler(plan.remove));

// Enrollments
router.get('/enrollments', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_READ), asyncHandler(enrollment.list));
router.post('/enrollments', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_WRITE), validate({ body: V.enroll }), asyncHandler(enrollment.enroll));
router.get('/enrollments/:id', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_READ), validate({ params: V.idParam }), asyncHandler(enrollment.getOne));
router.post('/enrollments/:id/approve', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_APPROVE), validate({ params: V.idParam }), asyncHandler(enrollment.approve));
router.post('/enrollments/:id/decline', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_APPROVE), validate({ params: V.idParam, body: V.declineEnrollment }), asyncHandler(enrollment.decline));
router.post('/enrollments/:id/waive', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_WRITE), validate({ params: V.idParam, body: V.waiveEnrollment }), asyncHandler(enrollment.waive));
router.post('/enrollments/:id/terminate', requirePermission(PERMISSIONS.BENEFIT_ENROLLMENT_APPROVE), validate({ params: V.idParam, body: V.terminateEnrollment }), asyncHandler(enrollment.terminate));

// Claims
router.get('/claims', requirePermission(PERMISSIONS.BENEFIT_CLAIM_READ), asyncHandler(claim.list));
router.post('/claims', requirePermission(PERMISSIONS.BENEFIT_CLAIM_WRITE), validate({ body: V.submitClaim }), asyncHandler(claim.submit));
router.get('/claims/:id', requirePermission(PERMISSIONS.BENEFIT_CLAIM_READ), validate({ params: V.idParam }), asyncHandler(claim.getOne));
router.post('/claims/:id/start-review', requirePermission(PERMISSIONS.BENEFIT_CLAIM_APPROVE), validate({ params: V.idParam }), asyncHandler(claim.startReview));
router.post('/claims/:id/approve', requirePermission(PERMISSIONS.BENEFIT_CLAIM_APPROVE), validate({ params: V.idParam, body: V.reviewClaim }), asyncHandler(claim.approve));
router.post('/claims/:id/reject', requirePermission(PERMISSIONS.BENEFIT_CLAIM_APPROVE), validate({ params: V.idParam, body: V.reviewClaim }), asyncHandler(claim.reject));
router.post('/claims/:id/reimburse', requirePermission(PERMISSIONS.BENEFIT_CLAIM_APPROVE), validate({ params: V.idParam, body: V.reimburseClaim }), asyncHandler(claim.reimburse));
router.post('/claims/:id/cancel', requirePermission(PERMISSIONS.BENEFIT_CLAIM_WRITE), validate({ params: V.idParam }), asyncHandler(claim.cancel));

// Loan programs
router.get('/loans/programs', requirePermission(PERMISSIONS.LOAN_PROGRAM_READ), asyncHandler(loan.listPrograms));
router.post('/loans/programs', requirePermission(PERMISSIONS.LOAN_PROGRAM_WRITE), validate({ body: V.createLoanProgram }), asyncHandler(loan.createProgram));
router.patch('/loans/programs/:id', requirePermission(PERMISSIONS.LOAN_PROGRAM_WRITE), validate({ params: V.idParam, body: V.updateLoanProgram }), asyncHandler(loan.updateProgram));
router.delete('/loans/programs/:id', requirePermission(PERMISSIONS.LOAN_PROGRAM_WRITE), validate({ params: V.idParam }), asyncHandler(loan.removeProgram));

// Loans
router.get('/loans', requirePermission(PERMISSIONS.LOAN_REQUEST_READ), asyncHandler(loan.list));
router.post('/loans', requirePermission(PERMISSIONS.LOAN_REQUEST_WRITE), validate({ body: V.applyLoan }), asyncHandler(loan.apply));
router.get('/loans/:id', requirePermission(PERMISSIONS.LOAN_REQUEST_READ), validate({ params: V.idParam }), asyncHandler(loan.getOne));
router.post('/loans/:id/manager-review', requirePermission(PERMISSIONS.LOAN_APPROVE), validate({ params: V.idParam, body: V.managerReviewLoan }), asyncHandler(loan.managerReview));
router.post('/loans/:id/admin-review', requirePermission(PERMISSIONS.LOAN_APPROVE), validate({ params: V.idParam, body: V.adminReviewLoan }), asyncHandler(loan.adminReview));
router.post('/loans/:id/disburse', requirePermission(PERMISSIONS.LOAN_DISBURSE), validate({ params: V.idParam }), asyncHandler(loan.disburse));
router.post('/loans/:id/repayments', requirePermission(PERMISSIONS.LOAN_APPROVE), validate({ params: V.idParam, body: V.recordLoanRepayment }), asyncHandler(loan.recordRepayment));

// Vouchers
router.get('/vouchers', requirePermission(PERMISSIONS.VOUCHER_READ), asyncHandler(voucher.list));
router.post('/vouchers', requirePermission(PERMISSIONS.VOUCHER_WRITE), validate({ body: V.issueVoucher }), asyncHandler(voucher.issue));
router.post('/vouchers/:id/deliver', requirePermission(PERMISSIONS.VOUCHER_WRITE), validate({ params: V.idParam }), asyncHandler(voucher.markDelivered));
router.post('/vouchers/:id/redeem', requirePermission(PERMISSIONS.VOUCHER_WRITE), validate({ params: V.idParam, body: V.redeemVoucher }), asyncHandler(voucher.redeem));
router.post('/vouchers/:id/cancel', requirePermission(PERMISSIONS.VOUCHER_WRITE), validate({ params: V.idParam }), asyncHandler(voucher.cancel));

// Discount partners
router.get('/discount-partners', requireAnyPermission(PERMISSIONS.DISCOUNT_PARTNER_READ, PERMISSIONS.BENEFIT_PLAN_READ), asyncHandler(discount.list));
router.post('/discount-partners', requirePermission(PERMISSIONS.DISCOUNT_PARTNER_WRITE), validate({ body: V.createDiscountPartner }), asyncHandler(discount.create));
router.get('/discount-partners/:id', requireAnyPermission(PERMISSIONS.DISCOUNT_PARTNER_READ, PERMISSIONS.BENEFIT_PLAN_READ), validate({ params: V.idParam }), asyncHandler(discount.getOne));
router.patch('/discount-partners/:id', requirePermission(PERMISSIONS.DISCOUNT_PARTNER_WRITE), validate({ params: V.idParam, body: V.updateDiscountPartner }), asyncHandler(discount.update));
router.delete('/discount-partners/:id', requirePermission(PERMISSIONS.DISCOUNT_PARTNER_WRITE), validate({ params: V.idParam }), asyncHandler(discount.remove));

// Dashboard
router.get('/dashboard/overview', requirePermission(PERMISSIONS.BENEFIT_PLAN_READ), asyncHandler(dashboard.overview));

module.exports = router;
