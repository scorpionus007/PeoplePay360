'use strict';

const { DataTypes } = require('sequelize');
const { BASELINE_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const DeviceBaselineCheck = sequelize.define(
    'DeviceBaselineCheck',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      device_id: { type: DataTypes.UUID, allowNull: false },
      baseline_control_id: { type: DataTypes.UUID, allowNull: false },
      status: {
        type: DataTypes.ENUM(...Object.values(BASELINE_STATUS)),
        allowNull: false,
        defaultValue: BASELINE_STATUS.UNKNOWN,
      },
      checked_at: { type: DataTypes.DATE, allowNull: true },
      evidence: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      remediation_note: { type: DataTypes.STRING(1000), allowNull: true },
      source: {
        type: DataTypes.ENUM('agent', 'manual', 'edr', 'external'),
        allowNull: false,
        defaultValue: 'agent',
      },
    },
    {
      tableName: 'it_device_baseline_checks',
      indexes: [
        { fields: ['device_id'] },
        { fields: ['baseline_control_id'] },
        { fields: ['device_id', 'baseline_control_id'], unique: true },
        { fields: ['status'] },
      ],
    }
  );

  DeviceBaselineCheck.associate = (models) => {
    DeviceBaselineCheck.belongsTo(models.Device, { as: 'device', foreignKey: 'device_id' });
    DeviceBaselineCheck.belongsTo(models.BaselineControl, {
      as: 'control',
      foreignKey: 'baseline_control_id',
    });
  };

  return DeviceBaselineCheck;
};
