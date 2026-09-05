'use strict';

const { DataTypes } = require('sequelize');
const { MOBILITY_PARTNER_CATEGORY } = require('../../../config/constants');

module.exports = (sequelize) => {
  const MobilityPartner = sequelize.define(
    'MobilityPartner',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      category: {
        type: DataTypes.ENUM(...Object.values(MOBILITY_PARTNER_CATEGORY)),
        allowNull: false,
      },
      country_code: { type: DataTypes.STRING(2), allowNull: true },
      city: { type: DataTypes.STRING(120), allowNull: true },
      contact_name: { type: DataTypes.STRING(200), allowNull: true },
      contact_email: { type: DataTypes.STRING(200), allowNull: true },
      contact_phone: { type: DataTypes.STRING(40), allowNull: true },
      website: { type: DataTypes.STRING(500), allowNull: true },
      contract_reference: { type: DataTypes.STRING(200), allowNull: true },
      contract_end_date: { type: DataTypes.DATEONLY, allowNull: true },
      rating: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
      notes: { type: DataTypes.STRING(2000), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'mobility_partners',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['category'] },
        { fields: ['country_code'] },
      ],
    }
  );

  MobilityPartner.associate = (models) => {
    MobilityPartner.hasMany(models.VisaSponsorship, {
      as: 'visa_cases',
      foreignKey: 'mobility_partner_id',
    });
    MobilityPartner.hasMany(models.RelocationCase, {
      as: 'relocations',
      foreignKey: 'mobility_partner_id',
    });
    MobilityPartner.hasMany(models.ImmigrationCase, {
      as: 'immigration_cases',
      foreignKey: 'mobility_partner_id',
    });
  };

  return MobilityPartner;
};
