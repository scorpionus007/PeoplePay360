'use strict';

const { DataTypes } = require('sequelize');
const { TIME_OFF_REQUEST_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const TimeOffRequest = sequelize.define(
    'TimeOffRequest',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      time_off_type_id: { type: DataTypes.UUID, allowNull: false },
      time_off_allocation_id: { type: DataTypes.UUID, allowNull: true },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: false },
      is_half_day: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      half_day_period: {
        type: DataTypes.ENUM('morning', 'afternoon'),
        allowNull: true,
      },
      duration: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      reason: { type: DataTypes.STRING(1000), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(TIME_OFF_REQUEST_STATUS)),
        allowNull: false,
        defaultValue: TIME_OFF_REQUEST_STATUS.PENDING,
      },
      submitted_at: { type: DataTypes.DATE, allowNull: true },
      approver_id: { type: DataTypes.UUID, allowNull: true },
      decided_at: { type: DataTypes.DATE, allowNull: true },
      decision_note: { type: DataTypes.STRING(1000), allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'time_off_requests',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['time_off_type_id'] },
        { fields: ['status'] },
        { fields: ['start_date', 'end_date'] },
      ],
    }
  );

  TimeOffRequest.associate = (models) => {
    TimeOffRequest.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    TimeOffRequest.belongsTo(models.TimeOffType, {
      as: 'time_off_type',
      foreignKey: 'time_off_type_id',
    });
    TimeOffRequest.belongsTo(models.TimeOffAllocation, {
      as: 'allocation',
      foreignKey: 'time_off_allocation_id',
    });
  };

  return TimeOffRequest;
};
