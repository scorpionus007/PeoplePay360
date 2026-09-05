'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  BENEFIT_ENROLLMENT_STATUS,
  BENEFIT_PLAN_STATUS,
} = require('../../../config/constants');

async function enroll({ organizationId, employeeId, planId, startDate, dependents = [], electedAmount, notes }) {
  return sequelize.transaction(async (transaction) => {
    const plan = await models.BenefitPlan.findOne({
      where: { id: planId, organization_id: organizationId },
      transaction,
    });
    if (!plan) throw AppError.notFound('Benefit plan not found');
    if (plan.status !== BENEFIT_PLAN_STATUS.ACTIVE) {
      throw AppError.conflict('Plan is not currently active');
    }
    if (plan.total_seats !== null && plan.total_seats !== undefined && plan.seats_used >= plan.total_seats) {
      throw AppError.conflict('No seats available for this plan');
    }
    if (!plan.dependents_allowed && dependents.length) {
      throw AppError.unprocessable('Plan does not allow dependents');
    }
    if (
      plan.dependents_allowed &&
      plan.max_dependents !== null &&
      plan.max_dependents !== undefined &&
      dependents.length > plan.max_dependents
    ) {
      throw AppError.unprocessable('Too many dependents for this plan', {
        max_dependents: plan.max_dependents,
      });
    }

    const existing = await models.BenefitEnrollment.findOne({
      where: {
        employee_id: employeeId,
        benefit_plan_id: planId,
        status: {
          [require('sequelize').Op.in]: [
            BENEFIT_ENROLLMENT_STATUS.ACTIVE,
            BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL,
          ],
        },
      },
      transaction,
    });
    if (existing) throw AppError.conflict('Employee already has an active or pending enrollment on this plan');

    const initialStatus = plan.approval_required
      ? BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL
      : BENEFIT_ENROLLMENT_STATUS.ACTIVE;

    const enrollment = await models.BenefitEnrollment.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        benefit_plan_id: planId,
        status: initialStatus,
        start_date: startDate,
        dependents_count: dependents.length,
        employee_monthly_cost: plan.employee_cost_amount,
        employer_monthly_cost: plan.employer_cost_amount,
        currency: plan.currency,
        elected_amount: electedAmount ?? null,
        notes: notes || null,
      },
      { transaction }
    );

    for (const dep of dependents) {
      await models.BenefitDependent.create(
        { ...dep, benefit_enrollment_id: enrollment.id },
        { transaction }
      );
    }

    if (initialStatus === BENEFIT_ENROLLMENT_STATUS.ACTIVE) {
      plan.seats_used = Number(plan.seats_used || 0) + 1;
      await plan.save({ transaction });
    }

    return enrollment;
  });
}

async function approveEnrollment({ organizationId, id, approverUserId }) {
  return sequelize.transaction(async (transaction) => {
    const enrollment = await models.BenefitEnrollment.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!enrollment) throw AppError.notFound('Enrollment not found');
    if (enrollment.status !== BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL) {
      throw AppError.conflict('Enrollment is not pending approval');
    }
    const plan = await models.BenefitPlan.findByPk(enrollment.benefit_plan_id, { transaction });
    if (!plan) throw AppError.notFound('Linked plan not found');
    if (plan.total_seats !== null && plan.total_seats !== undefined && plan.seats_used >= plan.total_seats) {
      throw AppError.conflict('No seats available');
    }

    enrollment.status = BENEFIT_ENROLLMENT_STATUS.ACTIVE;
    enrollment.approved_by = approverUserId;
    enrollment.approved_at = new Date();
    await enrollment.save({ transaction });

    plan.seats_used = Number(plan.seats_used || 0) + 1;
    await plan.save({ transaction });

    return enrollment;
  });
}

async function declineEnrollment({ organizationId, id, note }) {
  const enrollment = await models.BenefitEnrollment.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!enrollment) throw AppError.notFound('Enrollment not found');
  if (enrollment.status !== BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL) {
    throw AppError.conflict('Enrollment is not pending approval');
  }
  enrollment.status = BENEFIT_ENROLLMENT_STATUS.DECLINED;
  if (note) enrollment.notes = note;
  await enrollment.save();
  return enrollment;
}

async function waive({ organizationId, id, reason }) {
  const enrollment = await models.BenefitEnrollment.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!enrollment) throw AppError.notFound('Enrollment not found');
  if (enrollment.status !== BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL) {
    throw AppError.conflict('Only pending enrollments can be waived by the employee');
  }
  enrollment.status = BENEFIT_ENROLLMENT_STATUS.WAIVED;
  enrollment.waived_reason = reason || null;
  await enrollment.save();
  return enrollment;
}

async function terminate({ organizationId, id, endDate, reason }) {
  return sequelize.transaction(async (transaction) => {
    const enrollment = await models.BenefitEnrollment.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!enrollment) throw AppError.notFound('Enrollment not found');
    if (enrollment.status !== BENEFIT_ENROLLMENT_STATUS.ACTIVE) {
      throw AppError.conflict('Only active enrollments can be terminated');
    }
    enrollment.status = BENEFIT_ENROLLMENT_STATUS.TERMINATED;
    enrollment.end_date = endDate || new Date().toISOString().slice(0, 10);
    if (reason) enrollment.notes = reason;
    await enrollment.save({ transaction });

    const plan = await models.BenefitPlan.findByPk(enrollment.benefit_plan_id, { transaction });
    if (plan) {
      plan.seats_used = Math.max(0, Number(plan.seats_used || 0) - 1);
      await plan.save({ transaction });
    }
    return enrollment;
  });
}

module.exports = { enroll, approveEnrollment, declineEnrollment, waive, terminate };
