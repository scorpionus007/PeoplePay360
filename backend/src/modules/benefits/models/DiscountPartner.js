'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DiscountPartner = sequelize.define(
    'DiscountPartner',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      category: { type: DataTypes.STRING(80), allowNull: true },
      description: { type: DataTypes.STRING(2000), allowNull: true },
      website: { type: DataTypes.STRING(500), allowNull: true },
      discount_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: true },
      discount_code: { type: DataTypes.STRING(120), allowNull: true },
      terms: { type: DataTypes.STRING(2000), allowNull: true },
      valid_from: { type: DataTypes.DATEONLY, allowNull: true },
      valid_to: { type: DataTypes.DATEONLY, allowNull: true },
      contact_name: { type: DataTypes.STRING(150), allowNull: true },
      contact_email: { type: DataTypes.STRING(200), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'discount_partners',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['category'] },
        { fields: ['is_active'] },
      ],
    }
  );

  return DiscountPartner;
};
