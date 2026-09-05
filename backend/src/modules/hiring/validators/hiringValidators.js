'use strict';

const Joi = require('joi');
const {
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
} = require('../../../config/constants');

const uuid = Joi.string().uuid();
const currency = Joi.string().length(3).uppercase();
const money = Joi.number().min(0).precision(4);
const email = Joi.string().email({ tlds: { allow: false } });

exports.idParam = Joi.object({ id: uuid.required() });

exports.createRequisition = Joi.object({
  department_id: uuid.allow(null),
  hiring_manager_id: uuid.allow(null),
  ta_owner_id: uuid.allow(null),
  code: Joi.string().max(80).required(),
  title: Joi.string().max(200).required(),
  hiring_track: Joi.string().valid(...Object.values(HIRING_TRACK)).default('external'),
  seniority: Joi.string().max(80).allow(null, ''),
  headcount: Joi.number().integer().min(1).max(1000).default(1),
  employment_type: Joi.string().valid('full_time', 'part_time', 'contract', 'intern', 'freelancer', 'auditor').default('full_time'),
  description: Joi.string().allow(null, ''),
  responsibilities: Joi.string().allow(null, ''),
  requirements: Joi.string().allow(null, ''),
  nice_to_have: Joi.string().allow(null, ''),
  location: Joi.string().max(200).allow(null, ''),
  remote_allowed: Joi.boolean().default(false),
  currency: currency.default('USD'),
  salary_min: money.allow(null),
  salary_max: money.allow(null),
  salary_period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'yearly').default('yearly'),
  target_start_date: Joi.date().iso().allow(null),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  status: Joi.string().valid(...Object.values(REQUISITION_STATUS)).default('draft'),
});
exports.updateRequisition = exports.createRequisition.fork(['code', 'title'], (s) => s.optional()).keys({});
exports.approveRequisition = Joi.object({ note: Joi.string().max(1000).allow(null, '') });

exports.createJobBoard = Joi.object({
  vendor: Joi.string().valid('linkedin', 'indeed', 'glassdoor', 'monster', 'naukri', 'wellfound', 'custom').required(),
  display_name: Joi.string().max(200).required(),
  api_base_url: Joi.string().uri().max(500).allow(null, ''),
  credentials_ref: Joi.string().max(255).allow(null, ''),
  settings: Joi.object().default({}),
  is_active: Joi.boolean().default(true),
});
exports.updateJobBoard = exports.createJobBoard.fork(['vendor', 'display_name'], (s) => s.optional()).keys({});

exports.createJobPosting = Joi.object({
  requisition_id: uuid.required(),
  job_board_id: uuid.allow(null),
  channel: Joi.string().valid('careers_site', 'linkedin', 'indeed', 'glassdoor', 'monster', 'naukri', 'wellfound', 'referral_only', 'custom').default('careers_site'),
  title: Joi.string().max(200).required(),
  slug: Joi.string().max(200).allow(null, ''),
  external_reference: Joi.string().max(200).allow(null, ''),
  external_url: Joi.string().uri().max(1000).allow(null, ''),
  published_content: Joi.string().allow(null, ''),
  status: Joi.string().valid(...Object.values(JOB_POSTING_STATUS)).default('draft'),
});
exports.updateJobPosting = exports.createJobPosting.fork(['requisition_id', 'title'], (s) => s.optional()).keys({});

exports.createCandidate = Joi.object({
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).required(),
  email: email.required(),
  phone: Joi.string().max(40).allow(null, ''),
  current_title: Joi.string().max(200).allow(null, ''),
  current_company: Joi.string().max(200).allow(null, ''),
  location: Joi.string().max(200).allow(null, ''),
  country_code: Joi.string().length(2).allow(null, ''),
  linkedin_url: Joi.string().uri().max(500).allow(null, ''),
  github_url: Joi.string().uri().max(500).allow(null, ''),
  portfolio_url: Joi.string().uri().max(500).allow(null, ''),
  resume_url: Joi.string().uri().max(1000).allow(null, ''),
  years_of_experience: Joi.number().min(0).max(80).allow(null),
  expected_salary_min: money.allow(null),
  expected_salary_max: money.allow(null),
  expected_currency: currency.allow(null),
  notice_period_days: Joi.number().integer().min(0).max(365).allow(null),
  tags: Joi.array().items(Joi.string()).default([]),
  internal_notes: Joi.string().max(2000).allow(null, ''),
});
exports.updateCandidate = exports.createCandidate.fork(['first_name', 'last_name', 'email'], (s) => s.optional()).keys({
  is_blacklisted: Joi.boolean(),
});

exports.submitApplication = Joi.object({
  requisition_id: uuid.required(),
  job_posting_id: uuid.allow(null),
  referral_id: uuid.allow(null),
  source: Joi.string().valid(...Object.values(APPLICATION_SOURCE)).default('direct'),
  cover_letter_url: Joi.string().uri().max(1000).allow(null, ''),
  assigned_recruiter_id: uuid.allow(null),
  candidate: Joi.object({
    id: uuid.allow(null),
    first_name: Joi.string().max(100),
    last_name: Joi.string().max(100),
    email: email,
    phone: Joi.string().max(40).allow(null, ''),
    current_title: Joi.string().max(200).allow(null, ''),
    current_company: Joi.string().max(200).allow(null, ''),
    resume_url: Joi.string().uri().max(1000).allow(null, ''),
    linkedin_url: Joi.string().uri().max(500).allow(null, ''),
  })
    .required()
    .custom((v, helpers) => {
      if (!v.id && (!v.first_name || !v.last_name || !v.email)) {
        return helpers.error('any.custom', {
          message: 'Candidate id or full name and email is required',
        });
      }
      return v;
    }),
});

exports.progressApplication = Joi.object({
  to_stage: Joi.string().valid(...Object.values(APPLICATION_STAGE)).required(),
  note: Joi.string().max(1000).allow(null, ''),
  rejection_reason: Joi.string().max(1000).allow(null, ''),
});

exports.rejectApplication = Joi.object({ reason: Joi.string().max(1000).allow(null, '') });
exports.withdrawApplication = Joi.object({ note: Joi.string().max(1000).allow(null, '') });

exports.scheduleInterview = Joi.object({
  application_id: uuid.required(),
  round_index: Joi.number().integer().min(1).max(20).allow(null),
  interview_type: Joi.string().valid(...Object.values(INTERVIEW_TYPE)).default('video'),
  title: Joi.string().max(200).required(),
  scheduled_start: Joi.date().iso().required(),
  scheduled_end: Joi.date().iso().required(),
  timezone: Joi.string().max(64).default('UTC'),
  location: Joi.string().max(500).allow(null, ''),
  video_url: Joi.string().uri().max(1000).allow(null, ''),
  panelists: Joi.array()
    .items(
      Joi.object({
        user_id: uuid.required(),
        name: Joi.string().max(200).allow(null, ''),
        role: Joi.string().max(80).allow(null, ''),
      })
    )
    .default([]),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.rescheduleInterview = Joi.object({
  scheduled_start: Joi.date().iso(),
  scheduled_end: Joi.date().iso(),
  note: Joi.string().max(1000).allow(null, ''),
});

exports.cancelInterview = Joi.object({ reason: Joi.string().max(500).allow(null, '') });

exports.interviewFeedback = Joi.object({
  panelist_role: Joi.string().max(80).allow(null, ''),
  overall_rating: Joi.number().min(0).max(10).allow(null),
  recommendation: Joi.string().valid(...Object.values(INTERVIEW_RECOMMENDATION)).required(),
  strengths: Joi.string().allow(null, ''),
  concerns: Joi.string().allow(null, ''),
  questions_asked: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  criteria_scores: Joi.object().default({}),
});

exports.draftOffer = Joi.object({
  application_id: uuid.required(),
  title: Joi.string().max(200).required(),
  department_id: uuid.allow(null),
  manager_id: uuid.allow(null),
  base_salary: money.required(),
  currency: currency.default('USD'),
  salary_period: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'yearly').default('yearly'),
  sign_on_bonus: money.allow(null),
  annual_bonus_percent: Joi.number().min(0).max(100).allow(null),
  equity_shares: money.allow(null),
  equity_notes: Joi.string().max(2000).allow(null, ''),
  start_date: Joi.date().iso().allow(null),
  probation_days: Joi.number().integer().min(0).max(365).allow(null),
  expires_at: Joi.date().iso().allow(null),
  offer_letter_url: Joi.string().uri().max(1000).allow(null, ''),
  terms: Joi.string().allow(null, ''),
});
exports.updateOffer = exports.draftOffer.fork(['application_id', 'title', 'base_salary'], (s) => s.optional()).keys({});
exports.offerNote = Joi.object({ note: Joi.string().max(1000).allow(null, '') });

exports.submitReferral = Joi.object({
  referrer_employee_id: uuid.allow(null),
  requisition_id: uuid.allow(null),
  candidate_first_name: Joi.string().max(100).required(),
  candidate_last_name: Joi.string().max(100).required(),
  candidate_email: email.required(),
  candidate_phone: Joi.string().max(40).allow(null, ''),
  candidate_resume_url: Joi.string().uri().max(1000).allow(null, ''),
  relationship: Joi.string().max(200).allow(null, ''),
  recommendation: Joi.string().allow(null, ''),
});
exports.reviewReferral = Joi.object({
  status: Joi.string().valid(...Object.values(REFERRAL_STATUS)).required(),
  note: Joi.string().max(1000).allow(null, ''),
});
exports.payReferralBonus = Joi.object({
  amount: money.required(),
  currency: currency.default('USD'),
});
