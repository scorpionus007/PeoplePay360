'use strict';

const { DataTypes } = require('sequelize');
const { DEVICE_CATEGORY, OS_FAMILY } = require('../../../config/constants');

module.exports = (sequelize) => {
  const OnboardingKit = sequelize.define(
    'OnboardingKit',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(1000), allowNull: true },
      device_category: {
        type: DataTypes.ENUM(...Object.values(DEVICE_CATEGORY)),
        allowNull: false,
        defaultValue: DEVICE_CATEGORY.LAPTOP,
      },
      preferred_os_family: {
        type: DataTypes.ENUM(...Object.values(OS_FAMILY)),
        allowNull: false,
        defaultValue: OS_FAMILY.WINDOWS,
      },
      target_employee_types: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      software_ids: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      baseline_control_ids: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      specs: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'it_onboarding_kits',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['is_default'] },
      ],
    }
  );

  OnboardingKit.associate = (models) => {
    OnboardingKit.hasMany(models.OnboardingProvision, {
      as: 'provisions',
      foreignKey: 'onboarding_kit_id',
    });
  };

  return OnboardingKit;
};
