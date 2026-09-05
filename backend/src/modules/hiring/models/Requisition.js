'use strict';

const { DataTypes } = require('sequelize');
const { REQUISITION_STATUS, HIRING_TRACK } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Requisition = sequelize.define(
    'Requisition',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      department_id: { type: DataTypes.UUID, allowNull: true },
      hiring_manager_id: { type: DataTypes.UUID, allowNull: true },
      ta_owner_id: { type: DataTypes.UUID, allowNull: true },
      code: { type: DataTypes.STRING(80), allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: false },
      hiring_track: {
        type: DataTypes.ENUM(...Object.values(HIRING_TRACK)),
        allowNull: false,
        defaultValue: HIRING_TRACK.EXTERNAL,
      },
      seniority: { type: DataTypes.STRING(80), allowNull: true },
      headcount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      headcount_filled: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      employment_type: {
        type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern', 'freelancer', 'auditor'),
        allowNull: false,
        defaultValue: 'full_time',
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      responsibilities: { type: DataTypes.TEXT, allowNull: true },
      requirements: { type: DataTypes.TEXT, allowNull: true },
      nice_to_have: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.STRING(200), allowNull: true },
      remote_allowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      salary_min: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      salary_max: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      salary_period: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'yearly',
      },
      target_start_date: { type: DataTypes.DATEONLY, allowNull: true },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(REQUISITION_STATUS)),
        allowNull: false,
        defaultValue: REQUISITION_STATUS.DRAFT,
      },
      requested_by: { type: DataTypes.UUID, allowNull: true },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      approval_note: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {
      tableName: 'hiring_requisitions',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
        { fields: ['status'] },
        { fields: ['department_id'] },
      ],
    }
  );

  Requisition.associate = (models) => {
    Requisition.belongsTo(models.Department, { as: 'department', foreignKey: 'department_id' });
    Requisition.belongsTo(models.Employee, { as: 'hiring_manager', foreignKey: 'hiring_manager_id' });
    Requisition.hasMany(models.JobPosting, { as: 'postings', foreignKey: 'requisition_id' });
    Requisition.hasMany(models.Application, { as: 'applications', foreignKey: 'requisition_id' });
  };

  return Requisition;
};
