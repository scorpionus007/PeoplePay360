'use strict';

const { DataTypes } = require('sequelize');
const { HR_REQUEST_TYPE, HR_REQUEST_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const HRRequest = sequelize.define(
    'HRRequest',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      request_type: {
        type: DataTypes.ENUM(...Object.values(HR_REQUEST_TYPE)),
        allowNull: false,
        defaultValue: HR_REQUEST_TYPE.GENERAL,
      },
      subject: { type: DataTypes.STRING(200), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM(...Object.values(HR_REQUEST_STATUS)),
        allowNull: false,
        defaultValue: HR_REQUEST_STATUS.OPEN,
      },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
      },
      assigned_to: { type: DataTypes.UUID, allowNull: true },
      resolved_at: { type: DataTypes.DATE, allowNull: true },
      resolution_note: { type: DataTypes.STRING(2000), allowNull: true },
    },
    {
      tableName: 'hr_requests',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['assigned_to'] },
      ],
    }
  );

  HRRequest.associate = (models) => {
    HRRequest.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    HRRequest.hasMany(models.HRRequestMessage, { as: 'messages', foreignKey: 'hr_request_id' });
  };

  return HRRequest;
};
