'use strict';

const { DataTypes } = require('sequelize');
const { ATTENDANCE_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Attendance = sequelize.define(
    'Attendance',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      work_date: { type: DataTypes.DATEONLY, allowNull: false },
      check_in: { type: DataTypes.DATE, allowNull: true },
      check_out: { type: DataTypes.DATE, allowNull: true },
      break_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      worked_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
      overtime_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM(...Object.values(ATTENDANCE_STATUS)),
        allowNull: false,
        defaultValue: ATTENDANCE_STATUS.PRESENT,
      },
      source: {
        type: DataTypes.ENUM('self', 'device', 'manual', 'import', 'geo'),
        allowNull: false,
        defaultValue: 'self',
      },
      is_corrected: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      corrected_by: { type: DataTypes.UUID, allowNull: true },
      corrected_at: { type: DataTypes.DATE, allowNull: true },
      correction_note: { type: DataTypes.STRING(500), allowNull: true },
      notes: { type: DataTypes.STRING(500), allowNull: true },
      check_in_ip: { type: DataTypes.STRING(64), allowNull: true },
      check_out_ip: { type: DataTypes.STRING(64), allowNull: true },
      check_in_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
      check_in_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
      check_out_lat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
      check_out_lng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    },
    {
      tableName: 'attendances',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['employee_id', 'work_date'] },
        { fields: ['status'] },
        { fields: ['work_date'] },
      ],
    }
  );

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Attendance.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
  };

  return Attendance;
};
