'use strict';

const { DataTypes } = require('sequelize');
const { BENEFIT_CATEGORY, BENEFIT_PLAN_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BenefitPlan = sequelize.define(
    'BenefitPlan',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      provider_id: { type: DataTypes.UUID, allowNull: true },
      code: { type: DataTypes.STRING(80), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      category: {
        type: DataTypes.ENUM(...Object.values(BENEFIT_CATEGORY)),
        allowNull: false,
      },
      description: { type: DataTypes.STRING(2000), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      employer_cost_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      employee_cost_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      cost_frequency: {
        type: DataTypes.ENUM('per_month', 'per_year', 'per_payroll', 'one_time'),
        allowNull: false,
        defaultValue: 'per_month',
      },
      coverage_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      dependents_allowed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      max_dependents: { type: DataTypes.INTEGER, allowNull: true },
      taxable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      requires_enrollment: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      auto_enroll: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      approval_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      effective_from: { type: DataTypes.DATEONLY, allowNull: true },
      effective_to: { type: DataTypes.DATEONLY, allowNull: true },
      total_seats: { type: DataTypes.INTEGER, allowNull: true },
      seats_used: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM(...Object.values(BENEFIT_PLAN_STATUS)),
        allowNull: false,
        defaultValue: BENEFIT_PLAN_STATUS.DRAFT,
      },
      eligibility: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'benefit_plans',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
        { fields: ['category'] },
        { fields: ['status'] },
      ],
    }
  );

  BenefitPlan.associate = (models) => {
    BenefitPlan.belongsTo(models.BenefitProvider, { as: 'provider', foreignKey: 'provider_id' });
    BenefitPlan.hasMany(models.BenefitEnrollment, { as: 'enrollments', foreignKey: 'benefit_plan_id' });
    BenefitPlan.hasMany(models.BenefitClaim, { as: 'claims', foreignKey: 'benefit_plan_id' });
  };

  return BenefitPlan;
};
