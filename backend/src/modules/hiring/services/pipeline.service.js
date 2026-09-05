'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  APPLICATION_STAGE,
  REQUISITION_STATUS,
  REFERRAL_STATUS,
} = require('../../../config/constants');

const TERMINAL_STAGES = [APPLICATION_STAGE.HIRED, APPLICATION_STAGE.REJECTED, APPLICATION_STAGE.WITHDRAWN];

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
      const req = await models.Requisition.findByPk(application.requisition_id, { transaction });
      if (req) {
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
