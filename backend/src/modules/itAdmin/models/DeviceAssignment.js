'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceAssignment = sequelize.define(
    'DeviceAssignment',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      device_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      assigned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      returned_at: { type: DataTypes.DATE, allowNull: true },
      checkout_condition: { type: DataTypes.STRING(200), allowNull: true },
      return_condition: { type: DataTypes.STRING(200), allowNull: true },
      checkout_note: { type: DataTypes.STRING(500), allowNull: true },
      return_note: { type: DataTypes.STRING(500), allowNull: true },
      assigned_by: { type: DataTypes.UUID, allowNull: true },
      returned_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'it_device_assignments',
      indexes: [
        { fields: ['device_id'] },
        { fields: ['employee_id'] },
        { fields: ['returned_at'] },
      ],
    }
  );

  DeviceAssignment.associate = (models) => {
    DeviceAssignment.belongsTo(models.Device, { as: 'device', foreignKey: 'device_id' });
    DeviceAssignment.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
  };

  return DeviceAssignment;
};
