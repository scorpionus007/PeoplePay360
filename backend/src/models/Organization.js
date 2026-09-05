'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Organization = sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(200), allowNull: false },
      legal_name: { type: DataTypes.STRING(200), allowNull: true },
      registration_number: { type: DataTypes.STRING(120), allowNull: true },
      domain: { type: DataTypes.STRING(200), allowNull: true, unique: true },
      country_code: { type: DataTypes.STRING(2), allowNull: true },
      timezone: { type: DataTypes.STRING(64), allowNull: true, defaultValue: 'UTC' },
      base_currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'organizations',
      indexes: [{ fields: ['domain'], unique: true, where: { domain: { [require('sequelize').Op.ne]: null } } }],
    }
  );

  Organization.associate = (models) => {
    Organization.hasMany(models.User, { as: 'users', foreignKey: 'organization_id' });
    Organization.hasMany(models.Employee, { as: 'employees', foreignKey: 'organization_id' });
    Organization.hasMany(models.Department, { as: 'departments', foreignKey: 'organization_id' });
  };

  return Organization;
};
