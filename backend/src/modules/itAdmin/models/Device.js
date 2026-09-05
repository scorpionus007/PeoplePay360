'use strict';

const { DataTypes } = require('sequelize');
const {
  DEVICE_STATUS,
  DEVICE_OWNERSHIP,
  DEVICE_CATEGORY,
  OS_FAMILY,
} = require('../../../config/constants');

module.exports = (sequelize) => {
  const Device = sequelize.define(
    'Device',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      assigned_employee_id: { type: DataTypes.UUID, allowNull: true },
      asset_tag: { type: DataTypes.STRING(80), allowNull: false },
      hostname: { type: DataTypes.STRING(150), allowNull: true },
      serial_number: { type: DataTypes.STRING(120), allowNull: true },
      category: {
        type: DataTypes.ENUM(...Object.values(DEVICE_CATEGORY)),
        allowNull: false,
        defaultValue: DEVICE_CATEGORY.LAPTOP,
      },
      manufacturer: { type: DataTypes.STRING(120), allowNull: true },
      model: { type: DataTypes.STRING(150), allowNull: true },
      os_family: {
        type: DataTypes.ENUM(...Object.values(OS_FAMILY)),
        allowNull: false,
        defaultValue: OS_FAMILY.WINDOWS,
      },
      os_version: { type: DataTypes.STRING(80), allowNull: true },
      cpu: { type: DataTypes.STRING(120), allowNull: true },
      ram_gb: { type: DataTypes.INTEGER, allowNull: true },
      storage_gb: { type: DataTypes.INTEGER, allowNull: true },
      mac_address: { type: DataTypes.STRING(30), allowNull: true },
      ip_address: { type: DataTypes.STRING(64), allowNull: true },
      ownership: {
        type: DataTypes.ENUM(...Object.values(DEVICE_OWNERSHIP)),
        allowNull: false,
        defaultValue: DEVICE_OWNERSHIP.OWNED,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(DEVICE_STATUS)),
        allowNull: false,
        defaultValue: DEVICE_STATUS.IN_STOCK,
      },
      purchase_date: { type: DataTypes.DATEONLY, allowNull: true },
      purchase_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      warranty_end: { type: DataTypes.DATEONLY, allowNull: true },
      lease_vendor: { type: DataTypes.STRING(150), allowNull: true },
      lease_start: { type: DataTypes.DATEONLY, allowNull: true },
      lease_end: { type: DataTypes.DATEONLY, allowNull: true },
      lease_monthly_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      location: { type: DataTypes.STRING(150), allowNull: true },
      last_seen_at: { type: DataTypes.DATE, allowNull: true },
      agent_installed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      edr_installed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: DataTypes.STRING(1000), allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'it_devices',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'asset_tag'], unique: true },
        { fields: ['assigned_employee_id'] },
        { fields: ['status'] },
        { fields: ['category'] },
      ],
    }
  );

  Device.associate = (models) => {
    Device.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Device.belongsTo(models.Employee, { as: 'assigned_employee', foreignKey: 'assigned_employee_id' });
    Device.hasMany(models.DeviceAssignment, { as: 'assignments', foreignKey: 'device_id' });
    Device.hasMany(models.DeviceSoftware, { as: 'software_installs', foreignKey: 'device_id' });
    Device.hasMany(models.DeviceBaselineCheck, { as: 'baseline_checks', foreignKey: 'device_id' });
    Device.hasMany(models.EdrEvent, { as: 'edr_events', foreignKey: 'device_id' });
  };

  return Device;
};
