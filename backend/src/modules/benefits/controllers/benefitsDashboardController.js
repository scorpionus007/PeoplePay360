'use strict';

const { Op, fn, col } = require('sequelize');
const { models } = require('../../../models');
const { success } = require('../../../utils/response');
const money = require('../../../utils/money');
const {
  BENEFIT_ENROLLMENT_STATUS,
  BENEFIT_CLAIM_STATUS,
  LOAN_STATUS,
  VOUCHER_STATUS,
} = require('../../../config/constants');

async function overview(req, res) {
  const orgId = req.user.organizationId;
  const to = req.query.to || new Date().toISOString().slice(0, 10);
  const from = req.query.from || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 89);
    return d.toISOString().slice(0, 10);
  })();

  const [
    activePlans,
    activeEnrollments,
    pendingEnrollments,
    submittedClaims,
    approvedClaims,
    reimbursedTotals,
    outstandingLoans,
    activeLoansCount,
    disbursedLoans,
    issuedVouchers,
    plansByCategory,
    claimsByStatus,
  ] = await Promise.all([
    models.BenefitPlan.count({ where: { organization_id: orgId, status: 'active' } }),
    models.BenefitEnrollment.count({
      where: { organization_id: orgId, status: BENEFIT_ENROLLMENT_STATUS.ACTIVE },
    }),
    models.BenefitEnrollment.count({
      where: { organization_id: orgId, status: BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL },
    }),
    models.BenefitClaim.count({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [BENEFIT_CLAIM_STATUS.SUBMITTED, BENEFIT_CLAIM_STATUS.UNDER_REVIEW] },
      },
    }),
    models.BenefitClaim.count({
      where: {
        organization_id: orgId,
        status: BENEFIT_CLAIM_STATUS.APPROVED,
      },
    }),
    models.BenefitClaim.findOne({
      where: {
        organization_id: orgId,
        status: BENEFIT_CLAIM_STATUS.REIMBURSED,
        reimbursed_at: {
          [Op.gte]: new Date(`${from}T00:00:00Z`),
          [Op.lte]: new Date(`${to}T23:59:59Z`),
        },
      },
      attributes: [[fn('COALESCE', fn('SUM', col('reimbursed_amount')), 0), 'total']],
      raw: true,
    }),
    models.Loan.findOne({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [LOAN_STATUS.DISBURSED, LOAN_STATUS.REPAYING] },
      },
      attributes: [[fn('COALESCE', fn('SUM', col('outstanding_amount')), 0), 'total']],
      raw: true,
    }),
    models.Loan.count({
      where: { organization_id: orgId, status: { [Op.in]: [LOAN_STATUS.DISBURSED, LOAN_STATUS.REPAYING] } },
    }),
    models.Loan.count({
      where: { organization_id: orgId, status: { [Op.in]: [LOAN_STATUS.DISBURSED, LOAN_STATUS.REPAYING, LOAN_STATUS.CLOSED] } },
    }),
    models.GiftVoucher.count({
      where: {
        organization_id: orgId,
        status: { [Op.in]: [VOUCHER_STATUS.ISSUED, VOUCHER_STATUS.DELIVERED] },
      },
    }),
    models.BenefitPlan.findAll({
      where: { organization_id: orgId },
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    }),
    models.BenefitClaim.findAll({
      where: { organization_id: orgId },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
  ]);

  return success(res, {
    range: { from, to },
    kpis: {
      active_plans: activePlans,
      active_enrollments: activeEnrollments,
      pending_enrollments: pendingEnrollments,
      pending_claims: submittedClaims,
      approved_claims_awaiting_reimbursement: approvedClaims,
      reimbursed_amount_in_range: money.round(Number(reimbursedTotals?.total || 0)),
      outstanding_loan_amount: money.round(Number(outstandingLoans?.total || 0)),
      active_loans: activeLoansCount,
      total_disbursed_loans: disbursedLoans,
      vouchers_in_circulation: issuedVouchers,
    },
    plans_by_category: plansByCategory.map((r) => ({ category: r.category, count: Number(r.count || 0) })),
    claims_by_status: claimsByStatus.map((r) => ({ status: r.status, count: Number(r.count || 0) })),
  });
}

module.exports = { overview };
