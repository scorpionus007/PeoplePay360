'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { DEVICE_STATUS } = require('../../../config/constants');

async function assignToEmployee({ organizationId, deviceId, employeeId, assignedBy, checkoutCondition, note }) {
  return sequelize.transaction(async (transaction) => {
    const device = await models.Device.findOne({
      where: { id: deviceId, organization_id: organizationId },
      transaction,
    });
    if (!device) throw AppError.notFound('Device not found');
    if (device.status === DEVICE_STATUS.RETIRED) {
      throw AppError.conflict('Retired devices cannot be assigned');
    }
    if (device.status === DEVICE_STATUS.ASSIGNED && device.assigned_employee_id !== employeeId) {
      throw AppError.conflict('Device is already assigned to a different employee');
    }

    const employee = await models.Employee.findOne({
      where: { id: employeeId, organization_id: organizationId },
      transaction,
    });
    if (!employee) throw AppError.notFound('Employee not found');

    const assignment = await models.DeviceAssignment.create(
      {
        device_id: device.id,
        employee_id: employee.id,
        assigned_at: new Date(),
        checkout_condition: checkoutCondition || null,
        checkout_note: note || null,
        assigned_by: assignedBy || null,
      },
      { transaction }
    );

    device.assigned_employee_id = employee.id;
    device.status = DEVICE_STATUS.ASSIGNED;
    await device.save({ transaction });

    return { device, assignment };
  });
}

async function unassign({ organizationId, deviceId, returnedBy, returnCondition, note }) {
  return sequelize.transaction(async (transaction) => {
    const device = await models.Device.findOne({
      where: { id: deviceId, organization_id: organizationId },
      transaction,
    });
    if (!device) throw AppError.notFound('Device not found');
    if (device.status !== DEVICE_STATUS.ASSIGNED) {
      throw AppError.conflict('Device is not currently assigned');
    }

    const openAssignment = await models.DeviceAssignment.findOne({
      where: { device_id: device.id, returned_at: null },
      order: [['assigned_at', 'DESC']],
      transaction,
    });

    if (openAssignment) {
      openAssignment.returned_at = new Date();
      openAssignment.return_condition = returnCondition || null;
      openAssignment.return_note = note || null;
      openAssignment.returned_by = returnedBy || null;
      await openAssignment.save({ transaction });
    }

    device.assigned_employee_id = null;
    device.status = DEVICE_STATUS.IN_STOCK;
    await device.save({ transaction });

    return { device, assignment: openAssignment };
  });
}

module.exports = { assignToEmployee, unassign };
