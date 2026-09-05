'use strict';

const { DataTypes } = require('sequelize');
const { DEVICE_SOFTWARE_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const DeviceSoftware = sequelize.define(
    'DeviceSoftware',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      device_id: { type: DataTypes.UUID, allowNull: false },
      software_catalog_item_id: { type: DataTypes.UUID, allowNull: false },
      installed_at: { type: DataTypes.DATE, allowNull: true },
      version: { type: DataTypes.STRING(80), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(DEVICE_SOFTWARE_STATUS)),
        allowNull: false,
        defaultValue: DEVICE_SOFTWARE_STATUS.INSTALLED,
      },
      license_reference: { type: DataTypes.STRING(200), allowNull: true },
      installed_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'it_device_software',
      indexes: [
        { fields: ['device_id'] },
        { fields: ['software_catalog_item_id'] },
        { fields: ['device_id', 'software_catalog_item_id'], unique: true },
      ],
    }
  );

  DeviceSoftware.associate = (models) => {
    DeviceSoftware.belongsTo(models.Device, { as: 'device', foreignKey: 'device_id' });
    DeviceSoftware.belongsTo(models.SoftwareCatalogItem, {
      as: 'software',
      foreignKey: 'software_catalog_item_id',
    });
  };

  return DeviceSoftware;
};
