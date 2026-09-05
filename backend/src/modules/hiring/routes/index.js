'use strict';

const express = require('express');
const asyncHandler = require('../../../utils/asyncHandler');
const { requireAuth } = require('../../../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../../../middleware/rbac');
const { validate } = require('../../../middleware/validator');
const { PERMISSIONS } = require('../../../config/constants');
const V = require('../validators/hiringValidators');

const requisition = require('../controllers/requisitionController');
const jobBoard = require('../controllers/jobBoardController');
const jobPosting = require('../controllers/jobPostingController');
const candidate = require('../controllers/candidateController');
const application = require('../controllers/applicationController');
const interview = require('../controllers/interviewController');
const offer = require('../controllers/offerController');
const referral = require('../controllers/referralController');
const dashboard = require('../controllers/hiringDashboardController');

const router = express.Router();
router.use(requireAuth);

// Requisitions
router.get('/requisitions', requirePermission(PERMISSIONS.REQUISITION_READ), asyncHandler(requisition.list));
router.post('/requisitions', requirePermission(PERMISSIONS.REQUISITION_WRITE), validate({ body: V.createRequisition }), asyncHandler(requisition.create));
router.get('/requisitions/:id', requirePermission(PERMISSIONS.REQUISITION_READ), validate({ params: V.idParam }), asyncHandler(requisition.getOne));
router.patch('/requisitions/:id', requirePermission(PERMISSIONS.REQUISITION_WRITE), validate({ params: V.idParam, body: V.updateRequisition }), asyncHandler(requisition.update));
router.post('/requisitions/:id/submit', requirePermission(PERMISSIONS.REQUISITION_WRITE), validate({ params: V.idParam }), asyncHandler(requisition.submitForApproval));
router.post('/requisitions/:id/approve', requirePermission(PERMISSIONS.REQUISITION_APPROVE), validate({ params: V.idParam, body: V.approveRequisition }), asyncHandler(requisition.approve));
router.post('/requisitions/:id/hold', requirePermission(PERMISSIONS.REQUISITION_WRITE), validate({ params: V.idParam }), asyncHandler(requisition.hold));
router.post('/requisitions/:id/cancel', requirePermission(PERMISSIONS.REQUISITION_WRITE), validate({ params: V.idParam }), asyncHandler(requisition.cancel));
router.delete('/requisitions/:id', requirePermission(PERMISSIONS.REQUISITION_WRITE), validate({ params: V.idParam }), asyncHandler(requisition.remove));

// Job boards
router.get('/job-boards', requirePermission(PERMISSIONS.JOB_BOARD_READ), asyncHandler(jobBoard.list));
router.post('/job-boards', requirePermission(PERMISSIONS.JOB_BOARD_WRITE), validate({ body: V.createJobBoard }), asyncHandler(jobBoard.create));
router.patch('/job-boards/:id', requirePermission(PERMISSIONS.JOB_BOARD_WRITE), validate({ params: V.idParam, body: V.updateJobBoard }), asyncHandler(jobBoard.update));
router.delete('/job-boards/:id', requirePermission(PERMISSIONS.JOB_BOARD_WRITE), validate({ params: V.idParam }), asyncHandler(jobBoard.remove));

// Job postings
router.get('/postings', requirePermission(PERMISSIONS.JOB_POSTING_READ), asyncHandler(jobPosting.list));
router.post('/postings', requirePermission(PERMISSIONS.JOB_POSTING_WRITE), validate({ body: V.createJobPosting }), asyncHandler(jobPosting.create));
router.get('/postings/:id', requirePermission(PERMISSIONS.JOB_POSTING_READ), validate({ params: V.idParam }), asyncHandler(jobPosting.getOne));
router.patch('/postings/:id', requirePermission(PERMISSIONS.JOB_POSTING_WRITE), validate({ params: V.idParam, body: V.updateJobPosting }), asyncHandler(jobPosting.update));
router.post('/postings/:id/publish', requirePermission(PERMISSIONS.JOB_POSTING_PUBLISH), validate({ params: V.idParam }), asyncHandler(jobPosting.publish));
router.post('/postings/:id/close', requirePermission(PERMISSIONS.JOB_POSTING_WRITE), validate({ params: V.idParam }), asyncHandler(jobPosting.close));
router.delete('/postings/:id', requirePermission(PERMISSIONS.JOB_POSTING_WRITE), validate({ params: V.idParam }), asyncHandler(jobPosting.remove));

// Candidates
router.get('/candidates', requirePermission(PERMISSIONS.CANDIDATE_READ), asyncHandler(candidate.list));
router.post('/candidates', requirePermission(PERMISSIONS.CANDIDATE_WRITE), validate({ body: V.createCandidate }), asyncHandler(candidate.create));
router.get('/candidates/:id', requirePermission(PERMISSIONS.CANDIDATE_READ), validate({ params: V.idParam }), asyncHandler(candidate.getOne));
router.patch('/candidates/:id', requirePermission(PERMISSIONS.CANDIDATE_WRITE), validate({ params: V.idParam, body: V.updateCandidate }), asyncHandler(candidate.update));
router.delete('/candidates/:id', requirePermission(PERMISSIONS.CANDIDATE_WRITE), validate({ params: V.idParam }), asyncHandler(candidate.remove));

// Applications
router.get('/applications', requirePermission(PERMISSIONS.APPLICATION_READ), asyncHandler(application.list));
router.post('/applications', requirePermission(PERMISSIONS.APPLICATION_WRITE), validate({ body: V.submitApplication }), asyncHandler(application.submit));
router.get('/applications/:id', requirePermission(PERMISSIONS.APPLICATION_READ), validate({ params: V.idParam }), asyncHandler(application.getOne));
router.post('/applications/:id/progress', requirePermission(PERMISSIONS.APPLICATION_PROGRESS), validate({ params: V.idParam, body: V.progressApplication }), asyncHandler(application.progress));
router.post('/applications/:id/reject', requirePermission(PERMISSIONS.APPLICATION_PROGRESS), validate({ params: V.idParam, body: V.rejectApplication }), asyncHandler(application.reject));
router.post('/applications/:id/withdraw', requirePermission(PERMISSIONS.APPLICATION_WRITE), validate({ params: V.idParam, body: V.withdrawApplication }), asyncHandler(application.withdraw));

// Interviews
router.get('/interviews', requirePermission(PERMISSIONS.INTERVIEW_READ), asyncHandler(interview.list));
router.post('/interviews', requirePermission(PERMISSIONS.INTERVIEW_WRITE), validate({ body: V.scheduleInterview }), asyncHandler(interview.schedule));
router.get('/interviews/:id', requirePermission(PERMISSIONS.INTERVIEW_READ), validate({ params: V.idParam }), asyncHandler(interview.getOne));
router.patch('/interviews/:id/reschedule', requirePermission(PERMISSIONS.INTERVIEW_WRITE), validate({ params: V.idParam, body: V.rescheduleInterview }), asyncHandler(interview.reschedule));
router.post('/interviews/:id/cancel', requirePermission(PERMISSIONS.INTERVIEW_WRITE), validate({ params: V.idParam, body: V.cancelInterview }), asyncHandler(interview.cancel));
router.post('/interviews/:id/feedback', requirePermission(PERMISSIONS.INTERVIEW_FEEDBACK_WRITE), validate({ params: V.idParam, body: V.interviewFeedback }), asyncHandler(interview.submitFeedback));

// Offers
router.get('/offers', requirePermission(PERMISSIONS.OFFER_READ), asyncHandler(offer.list));
router.post('/offers', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ body: V.draftOffer }), asyncHandler(offer.draft));
router.get('/offers/:id', requirePermission(PERMISSIONS.OFFER_READ), validate({ params: V.idParam }), asyncHandler(offer.getOne));
router.patch('/offers/:id', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam, body: V.updateOffer }), asyncHandler(offer.update));
router.post('/offers/:id/submit', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam }), asyncHandler(offer.submitForApproval));
router.post('/offers/:id/approve', requirePermission(PERMISSIONS.OFFER_APPROVE), validate({ params: V.idParam, body: V.offerNote }), asyncHandler(offer.approve));
router.post('/offers/:id/extend', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam }), asyncHandler(offer.extend));
router.post('/offers/:id/accept', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam, body: V.offerNote }), asyncHandler(offer.accept));
router.post('/offers/:id/decline', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam, body: V.offerNote }), asyncHandler(offer.decline));
router.post('/offers/:id/rescind', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam, body: V.offerNote }), asyncHandler(offer.rescind));
router.delete('/offers/:id', requirePermission(PERMISSIONS.OFFER_WRITE), validate({ params: V.idParam }), asyncHandler(offer.remove));

// Referrals
router.get('/referrals', requireAnyPermission(PERMISSIONS.REFERRAL_READ, PERMISSIONS.REFERRAL_SUBMIT), asyncHandler(referral.list));
router.post('/referrals', requireAnyPermission(PERMISSIONS.REFERRAL_SUBMIT, PERMISSIONS.REFERRAL_WRITE), validate({ body: V.submitReferral }), asyncHandler(referral.submit));
router.get('/referrals/:id', requireAnyPermission(PERMISSIONS.REFERRAL_READ, PERMISSIONS.REFERRAL_SUBMIT), validate({ params: V.idParam }), asyncHandler(referral.getOne));
router.post('/referrals/:id/review', requirePermission(PERMISSIONS.REFERRAL_WRITE), validate({ params: V.idParam, body: V.reviewReferral }), asyncHandler(referral.review));
router.post('/referrals/:id/pay-bonus', requirePermission(PERMISSIONS.REFERRAL_WRITE), validate({ params: V.idParam, body: V.payReferralBonus }), asyncHandler(referral.markBonusPaid));

// Dashboard
router.get('/dashboard/overview', requireAnyPermission(PERMISSIONS.REQUISITION_READ, PERMISSIONS.APPLICATION_READ), asyncHandler(dashboard.overview));

module.exports = router;
