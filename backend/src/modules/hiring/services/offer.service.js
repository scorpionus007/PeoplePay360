'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const {
  OFFER_STATUS,
  APPLICATION_STAGE,
} = require('../../../config/constants');
const pipeline = require('./pipeline.service');

async function draft({ organizationId, applicationId, payload }) {
  return sequelize.transaction(async (transaction) => {
    const application = await models.Application.findOne({
      where: { id: applicationId, organization_id: organizationId },
      transaction,
    });
    if (!application) throw AppError.notFound('Application not found');

    return models.Offer.create(
      {
        ...payload,
        organization_id: organizationId,
        application_id: applicationId,
        candidate_id: application.candidate_id,
        requisition_id: application.requisition_id,
        status: OFFER_STATUS.DRAFT,
      },
      { transaction }
    );
  });
}

async function submitForApproval({ organizationId, id }) {
  const offer = await models.Offer.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!offer) throw AppError.notFound('Offer not found');
  if (offer.status !== OFFER_STATUS.DRAFT) throw AppError.conflict('Only draft offers can be submitted');
  offer.status = OFFER_STATUS.PENDING_APPROVAL;
  await offer.save();
  return offer;
}

async function approve({ organizationId, id, approverUserId, note }) {
  const offer = await models.Offer.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!offer) throw AppError.notFound('Offer not found');
  if (![OFFER_STATUS.DRAFT, OFFER_STATUS.PENDING_APPROVAL].includes(offer.status)) {
    throw AppError.conflict('Offer is not in an approvable state');
  }
  // Approving records the approver and puts the offer in the approved
  // (pending_approval) state, from which it can be extended to the candidate.
  offer.status = OFFER_STATUS.PENDING_APPROVAL;
  offer.approved_by = approverUserId;
  offer.approved_at = new Date();
  offer.approval_note = note || null;
  await offer.save();
  return offer;
}

async function extend({ organizationId, id, actorUserId }) {
  return sequelize.transaction(async (transaction) => {
    const offer = await models.Offer.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!offer) throw AppError.notFound('Offer not found');
    // An offer must be approved before it can be extended to the candidate.
    if (offer.status !== OFFER_STATUS.PENDING_APPROVAL || !offer.approved_at) {
      throw AppError.conflict('Offer must be approved before it can be extended');
    }
    offer.status = OFFER_STATUS.EXTENDED;
    offer.extended_at = new Date();
    await offer.save({ transaction });

    const application = await models.Application.findByPk(offer.application_id, { transaction });
    if (application && application.current_stage !== APPLICATION_STAGE.OFFER) {
      const prior = application.current_stage;
      application.current_stage = APPLICATION_STAGE.OFFER;
      await application.save({ transaction });
      await models.ApplicationStageHistory.create(
        {
          application_id: application.id,
          from_stage: prior,
          to_stage: APPLICATION_STAGE.OFFER,
          changed_by: actorUserId || null,
          note: `Offer ${offer.id} extended`,
        },
        { transaction }
      );
    }

    return offer;
  });
}

async function accept({ organizationId, id, note, actorUserId }) {
  return sequelize.transaction(async (transaction) => {
    const offer = await models.Offer.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!offer) throw AppError.notFound('Offer not found');
    if (![OFFER_STATUS.EXTENDED, OFFER_STATUS.NEGOTIATING].includes(offer.status)) {
      throw AppError.conflict('Only extended offers can be accepted');
    }
    // A lapsed offer cannot be accepted; flip it to expired instead.
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
      offer.status = OFFER_STATUS.EXPIRED;
      await offer.save({ transaction });
      throw AppError.conflict('This offer has expired');
    }
    offer.status = OFFER_STATUS.ACCEPTED;
    offer.responded_at = new Date();
    offer.response_note = note || null;
    await offer.save({ transaction });

    // Auto move application to hired.
    await pipeline.moveStage({
      organizationId,
      applicationId: offer.application_id,
      toStage: APPLICATION_STAGE.HIRED,
      actorUserId,
      note: `Offer ${offer.id} accepted`,
    });

    return offer;
  });
}

async function decline({ organizationId, id, note }) {
  const offer = await models.Offer.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!offer) throw AppError.notFound('Offer not found');
  if (![OFFER_STATUS.EXTENDED, OFFER_STATUS.NEGOTIATING].includes(offer.status)) {
    throw AppError.conflict('Only extended offers can be declined');
  }
  offer.status = OFFER_STATUS.DECLINED;
  offer.responded_at = new Date();
  offer.response_note = note || null;
  await offer.save();
  return offer;
}

async function rescind({ organizationId, id, note }) {
  const offer = await models.Offer.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!offer) throw AppError.notFound('Offer not found');
  if ([OFFER_STATUS.ACCEPTED, OFFER_STATUS.DECLINED, OFFER_STATUS.RESCINDED, OFFER_STATUS.EXPIRED].includes(offer.status)) {
    throw AppError.conflict('Offer cannot be rescinded in current state');
  }
  offer.status = OFFER_STATUS.RESCINDED;
  offer.response_note = note || offer.response_note;
  await offer.save();
  return offer;
}

module.exports = { draft, submitForApproval, approve, extend, accept, decline, rescind };
