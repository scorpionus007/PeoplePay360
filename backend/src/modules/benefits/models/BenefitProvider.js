'use strict';

const { DataTypes } = require('sequelize');
const { BENEFIT_CATEGORY } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BenefitProvider = sequelize.define(
    'BenefitProvider',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      category: {
        type: DataTypes.ENUM(...Object.values(BENEFIT_CATEGORY)),
        allowNull: false,
      },
      contact_email: { type: DataTypes.STRING(200), allowNull: true },
      contact_phone: { type: DataTypes.STRING(40), allowNull: true },
      website: { type: DataTypes.STRING(500), allowNull: true },
      country_code: { type: DataTypes.STRING(2), allowNull: true },
      support_hours: { type: DataTypes.STRING(200), allowNull: true },
      account_reference: { type: DataTypes.STRING(200), allowNull: true },
      notes: { type: DataTypes.STRING(2000), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'benefit_providers',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['category'] },
      ],
    }
  );

  BenefitProvider.associate = (models) => {
    BenefitProvider.hasMany(models.BenefitPlan, { as: 'plans', foreignKey: 'provider_id' });
  };

  return BenefitProvider;
};
