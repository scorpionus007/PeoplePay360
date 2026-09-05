'use strict';

const { DataTypes } = require('sequelize');
const { TIME_OFF_UNIT } = require('../../../config/constants');

module.exports = (sequelize) => {
  const TimeOffType = sequelize.define(
    'TimeOffType',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(1000), allowNull: true },
      color: { type: DataTypes.STRING(7), allowNull: false, defaultValue: '#2563eb' },
      unit: {
        type: DataTypes.ENUM(...Object.values(TIME_OFF_UNIT)),
        allowNull: false,
        defaultValue: TIME_OFF_UNIT.DAYS,
      },
      requires_allocation: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      requires_approval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      affects_payroll: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      default_allocation: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      max_carry_forward: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'time_off_types',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
      ],
    }
  );

  TimeOffType.associate = (models) => {
    TimeOffType.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    TimeOffType.hasMany(models.TimeOffAllocation, { as: 'allocations', foreignKey: 'time_off_type_id' });
    TimeOffType.hasMany(models.TimeOffRequest, { as: 'requests', foreignKey: 'time_off_type_id' });
  };

  return TimeOffType;
};
