'use strict';

const { DataTypes } = require('sequelize');
const { ONBOARDING_PROVISION_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const OnboardingProvision = sequelize.define(
    'OnboardingProvision',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      onboarding_kit_id: { type: DataTypes.UUID, allowNull: false },
      device_id: { type: DataTypes.UUID, allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(ONBOARDING_PROVISION_STATUS)),
        allowNull: false,
        defaultValue: ONBOARDING_PROVISION_STATUS.REQUESTED,
      },
      shipping_address: { type: DataTypes.STRING(500), allowNull: true },
      shipping_reference: { type: DataTypes.STRING(200), allowNull: true },
      estimated_ready_date: { type: DataTypes.DATEONLY, allowNull: true },
      dispatched_at: { type: DataTypes.DATE, allowNull: true },
      delivered_at: { type: DataTypes.DATE, allowNull: true },
      activated_at: { type: DataTypes.DATE, allowNull: true },
      note: { type: DataTypes.STRING(1000), allowNull: true },
      requested_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'it_onboarding_provisions',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
      ],
    }
  );

  OnboardingProvision.associate = (models) => {
    OnboardingProvision.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    OnboardingProvision.belongsTo(models.OnboardingKit, {
      as: 'kit',
      foreignKey: 'onboarding_kit_id',
    });
    OnboardingProvision.belongsTo(models.Device, { as: 'device', foreignKey: 'device_id' });
  };

  return OnboardingProvision;
};
