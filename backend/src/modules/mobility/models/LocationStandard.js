'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LocationStandard = sequelize.define(
    'LocationStandard',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      country_code: { type: DataTypes.STRING(2), allowNull: false },
      region_code: { type: DataTypes.STRING(20), allowNull: true },
      city: { type: DataTypes.STRING(120), allowNull: true },
      display_name: { type: DataTypes.STRING(200), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      timezone: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'UTC' },
      standard_weekly_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 40 },
      minimum_pto_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
      minimum_sick_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
      overtime_multiplier: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 1.5 },
      minimum_wage_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      minimum_wage_period: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true,
      },
      probation_max_days: { type: DataTypes.INTEGER, allowNull: true },
      notice_period_days: { type: DataTypes.INTEGER, allowNull: true },
      social_security_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: true },
      employer_contribution_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: true },
      requires_work_visa_for_foreign_workers: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      permits_remote_work: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      public_holidays: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      compliance_notes: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'mobility_location_standards',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['country_code'] },
        { fields: ['organization_id', 'country_code', 'region_code'], unique: true },
      ],
    }
  );

  return LocationStandard;
};
