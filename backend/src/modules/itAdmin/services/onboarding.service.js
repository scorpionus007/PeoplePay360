'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { ONBOARDING_PROVISION_STATUS, DEVICE_STATUS } = require('../../../config/constants');

async function provision({ organizationId, employeeId, onboardingKitId, deviceId, shippingAddress, estimatedReadyDate, requestedBy, note }) {
  return sequelize.transaction(async (transaction) => {
    const kit = await models.OnboardingKit.findOne({
      where: { id: onboardingKitId, organization_id: organizationId },
      transaction,
    });
    if (!kit) throw AppError.notFound('Onboarding kit not found');

    const employee = await models.Employee.findOne({
      where: { id: employeeId, organization_id: organizationId },
      transaction,
    });
    if (!employee) throw AppError.notFound('Employee not found');

    let device = null;
    if (deviceId) {
      device = await models.Device.findOne({
        where: { id: deviceId, organization_id: organizationId },
        transaction,
      });
      if (!device) throw AppError.notFound('Device not found');
      if (device.status !== DEVICE_STATUS.IN_STOCK) {
        throw AppError.conflict('Device is not in stock');
      }
    }

    const provision = await models.OnboardingProvision.create(
      {
        organization_id: organizationId,
        employee_id: employeeId,
        onboarding_kit_id: onboardingKitId,
        device_id: device ? device.id : null,
        shipping_address: shippingAddress || null,
        estimated_ready_date: estimatedReadyDate || null,
        note: note || null,
        requested_by: requestedBy || null,
        status: ONBOARDING_PROVISION_STATUS.REQUESTED,
      },
      { transaction }
    );

    return provision;
  });
}

async function advanceStatus({ organizationId, id, status, actorUserId, deviceId }) {
  return sequelize.transaction(async (transaction) => {
    const provision = await models.OnboardingProvision.findOne({
      where: { id, organization_id: organizationId },
      transaction,
    });
    if (!provision) throw AppError.notFound('Provision not found');

    const now = new Date();
    provision.status = status;
    if (status === ONBOARDING_PROVISION_STATUS.DISPATCHED) provision.dispatched_at = now;
    if (status === ONBOARDING_PROVISION_STATUS.DELIVERED) provision.delivered_at = now;

    if (status === ONBOARDING_PROVISION_STATUS.ACTIVATED) {
      provision.activated_at = now;
      const targetDeviceId = deviceId || provision.device_id;
      if (targetDeviceId) {
        const device = await models.Device.findOne({
          where: { id: targetDeviceId, organization_id: organizationId },
          transaction,
        });
        if (!device) throw AppError.notFound('Device not found');
        if (
          device.status !== DEVICE_STATUS.IN_STOCK &&
          !(device.status === DEVICE_STATUS.ASSIGNED && device.assigned_employee_id === provision.employee_id)
        ) {
          throw AppError.conflict('Device is not available for onboarding');
        }
        device.assigned_employee_id = provision.employee_id;
        device.status = DEVICE_STATUS.ASSIGNED;
        await device.save({ transaction });

        await models.DeviceAssignment.create(
          {
            device_id: device.id,
            employee_id: provision.employee_id,
            assigned_at: now,
            checkout_condition: 'onboarding kit dispatched device',
            checkout_note: `Auto assigned via onboarding provision ${provision.id}`,
            assigned_by: actorUserId || null,
          },
          { transaction }
        );

        provision.device_id = device.id;
      }
    }

    await provision.save({ transaction });
    return provision;
  });
}

module.exports = { provision, advanceStatus };
