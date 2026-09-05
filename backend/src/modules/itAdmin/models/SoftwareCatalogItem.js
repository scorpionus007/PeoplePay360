'use strict';

const { DataTypes } = require('sequelize');
const { SOFTWARE_LICENSE_TYPE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const SoftwareCatalogItem = sequelize.define(
    'SoftwareCatalogItem',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      vendor: { type: DataTypes.STRING(150), allowNull: true },
      category: { type: DataTypes.STRING(80), allowNull: true },
      version: { type: DataTypes.STRING(80), allowNull: true },
      license_type: {
        type: DataTypes.ENUM(...Object.values(SOFTWARE_LICENSE_TYPE)),
        allowNull: false,
        defaultValue: SOFTWARE_LICENSE_TYPE.SUBSCRIPTION,
      },
      unit_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      total_seats: { type: DataTypes.INTEGER, allowNull: true },
      seats_allocated: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      renewal_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_managed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      description: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {
      tableName: 'it_software_catalog',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'name'] },
      ],
    }
  );

  SoftwareCatalogItem.associate = (models) => {
    SoftwareCatalogItem.hasMany(models.DeviceSoftware, {
      as: 'installs',
      foreignKey: 'software_catalog_item_id',
    });
  };

  return SoftwareCatalogItem;
};
