'use strict';

const { DataTypes } = require('sequelize');
const { BASELINE_CATEGORY } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BaselineControl = sequelize.define(
    'BaselineControl',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      category: {
        type: DataTypes.ENUM(...Object.values(BASELINE_CATEGORY)),
        allowNull: false,
      },
      description: { type: DataTypes.STRING(1000), allowNull: true },
      severity: {
        type: DataTypes.ENUM('info', 'low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium',
      },
      is_mandatory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      remediation_guidance: { type: DataTypes.STRING(2000), allowNull: true },
    },
    {
      tableName: 'it_baseline_controls',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
        { fields: ['category'] },
      ],
    }
  );

  BaselineControl.associate = (models) => {
    BaselineControl.hasMany(models.DeviceBaselineCheck, {
      as: 'checks',
      foreignKey: 'baseline_control_id',
    });
  };

  return BaselineControl;
};
