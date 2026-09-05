'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  APPLICATION_STAGE,
  REQUISITION_STATUS,
  REFERRAL_STATUS,
} = require('../../../config/constants');

const TERMINAL_STAGES = [APPLICATION_STAGE.HIRED, APPLICATION_STAGE.REJECTED, APPLICATION_STAGE.WITHDRAWN];

// Forward-only pipeline order. reject/withdraw/on_hold are escapes reachable
// from any non-terminal stage; on_hold can resume to any forward stage.
const STAGE_ORDER = [
  APPLICATION_STAGE.APPLIED,
  APPLICATION_STAGE.SCREENING,
  APPLICATION_STAGE.PHONE_SCREEN,
  APPLICATION_STAGE.ASSESSMENT,
  APPLICATION_STAGE.INTERVIEW,
  APPLICATION_STAGE.ONSITE,
  APPLICATION_STAGE.OFFER,
  APPLICATION_STAGE.HIRED,
];
const STAGE_ESCAPES = [APPLICATION_STAGE.REJECTED, APPLICATION_STAGE.WITHDRAWN, APPLICATION_STAGE.ON_HOLD];

function assertValidTransition(from, to) {
  if (STAGE_ESCAPES.includes(to)) return;
  if (to === APPLICATION_STAGE.HIRED && from !== APPLICATION_STAGE.OFFER) {
    throw AppError.conflict('An application can only be marked hired from the offer stage');
  }
  if (from === APPLICATION_STAGE.ON_HOLD) return; // resume from hold
  const fi = STAGE_ORDER.indexOf(from);
  const ti = STAGE_ORDER.indexOf(to);
  if (fi === -1 || ti === -1) throw AppError.conflict('Unknown application stage transition');
  if (ti <= fi) throw AppError.conflict('An application cannot move backward in the pipeline');
}

async function moveStage({ organizationId, applicationId, toStage, actorUserId, note, rejectionReason }) {
  return sequelize.transaction(async (transaction) => {
    const application = await models.Application.findOne({
      where: { id: applicationId, organization_id: organizationId },
      transaction,
    });
    if (!application) throw AppError.notFound('Application not found');
    if (application.current_stage === toStage) return application;

    if (TERMINAL_STAGES.includes(application.current_stage)) {
      throw AppError.conflict('Application is already in a terminal stage');
    }

    assertValidTransition(application.current_stage, toStage);

    const fromStage = application.current_stage;
    await models.ApplicationStageHistory.create(
      {
        application_id: application.id,
        from_stage: fromStage,
        to_stage: toStage,
        changed_by: actorUserId || null,
        note: note || null,
      },
      { transaction }
    );

    application.current_stage = toStage;
    if (toStage === APPLICATION_STAGE.REJECTED) {
      application.rejected_at = new Date();
      application.rejection_reason = rejectionReason || note || null;
    }
    await application.save({ transaction });

    if (toStage === APPLICATION_STAGE.HIRED) {
      const req = await models.Requisition.findOne({
        where: { id: application.requisition_id, organization_id: organizationId },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
      if (req) {
        if (Number(req.headcount_filled || 0) >= Number(req.headcount || 0)) {
          throw AppError.conflict('Requisition headcount is already filled');
        }
        req.headcount_filled = Number(req.headcount_filled || 0) + 1;
        if (req.headcount_filled >= req.headcount) req.status = REQUISITION_STATUS.FILLED;
        await req.save({ transaction });
      }
      if (application.referral_id) {
        const referral = await models.Referral.findByPk(application.referral_id, { transaction });
        if (referral && referral.status !== REFERRAL_STATUS.HIRED) {
          referral.status = REFERRAL_STATUS.HIRED;
          await referral.save({ transaction });
        }
      }
    }

    return application;
  });
}

async function reject({ organizationId, applicationId, actorUserId, reason }) {
  return moveStage({
    organizationId,
    applicationId,
    toStage: APPLICATION_STAGE.REJECTED,
    actorUserId,
    rejectionReason: reason,
    note: reason,
  });
}

async function withdraw({ organizationId, applicationId, actorUserId, note }) {
  return moveStage({
    organizationId,
    applicationId,
    toStage: APPLICATION_STAGE.WITHDRAWN,
    actorUserId,
    note,
  });
}

module.exports = { moveStage, reject, withdraw };
