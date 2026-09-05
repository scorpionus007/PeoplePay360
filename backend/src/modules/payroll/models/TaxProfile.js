'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaxProfile = sequelize.define(
    'TaxProfile',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      country_code: { type: DataTypes.STRING(2), allowNull: false },
      region_code: { type: DataTypes.STRING(20), allowNull: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(1000), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      slabs: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      flat_percent: { type: DataTypes.DECIMAL(9, 4), allowNull: true },
      social_security_percent: { type: DataTypes.DECIMAL(9, 4), allowNull: true },
      employer_contribution_percent: { type: DataTypes.DECIMAL(9, 4), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      effective_from: { type: DataTypes.DATEONLY, allowNull: true },
      effective_to: { type: DataTypes.DATEONLY, allowNull: true },
    },
    {
      tableName: 'tax_profiles',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['country_code'] },
      ],
    }
  );

  return TaxProfile;
};
