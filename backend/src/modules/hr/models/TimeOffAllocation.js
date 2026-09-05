'use strict';

const { DataTypes } = require('sequelize');
const { TIME_OFF_ALLOCATION_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const TimeOffAllocation = sequelize.define(
    'TimeOffAllocation',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      time_off_type_id: { type: DataTypes.UUID, allowNull: false },
      allocated_amount: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      taken_amount: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      pending_amount: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      valid_from: { type: DataTypes.DATEONLY, allowNull: false },
      valid_to: { type: DataTypes.DATEONLY, allowNull: true },
      allocation_note: { type: DataTypes.STRING(500), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(TIME_OFF_ALLOCATION_STATUS)),
        allowNull: false,
        defaultValue: TIME_OFF_ALLOCATION_STATUS.DRAFT,
      },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'time_off_allocations',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['time_off_type_id'] },
        { fields: ['status'] },
        { fields: ['employee_id', 'time_off_type_id', 'valid_from'] },
      ],
    }
  );

  TimeOffAllocation.associate = (models) => {
    TimeOffAllocation.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    TimeOffAllocation.belongsTo(models.TimeOffType, {
      as: 'time_off_type',
      foreignKey: 'time_off_type_id',
    });
    TimeOffAllocation.hasMany(models.TimeOffRequest, {
      as: 'requests',
      foreignKey: 'time_off_allocation_id',
    });
  };

  TimeOffAllocation.prototype.remaining = function remaining() {
    const alloc = Number(this.allocated_amount || 0);
    const taken = Number(this.taken_amount || 0);
    const pending = Number(this.pending_amount || 0);
    return alloc - taken - pending;
  };

  return TimeOffAllocation;
};
