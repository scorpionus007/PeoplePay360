'use strict';

const { DataTypes } = require('sequelize');
const { BENEFIT_ENROLLMENT_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BenefitEnrollment = sequelize.define(
    'BenefitEnrollment',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      benefit_plan_id: { type: DataTypes.UUID, allowNull: false },
      status: {
        type: DataTypes.ENUM(...Object.values(BENEFIT_ENROLLMENT_STATUS)),
        allowNull: false,
        defaultValue: BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL,
      },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: true },
      dependents_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      employee_monthly_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      employer_monthly_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      elected_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      notes: { type: DataTypes.STRING(1000), allowNull: true },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      waived_reason: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'benefit_enrollments',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['benefit_plan_id'] },
        { fields: ['status'] },
        { fields: ['employee_id', 'benefit_plan_id', 'start_date'], unique: true },
      ],
    }
  );

  BenefitEnrollment.associate = (models) => {
    BenefitEnrollment.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    BenefitEnrollment.belongsTo(models.BenefitPlan, { as: 'plan', foreignKey: 'benefit_plan_id' });
    BenefitEnrollment.hasMany(models.BenefitDependent, {
      as: 'dependents',
      foreignKey: 'benefit_enrollment_id',
    });
    BenefitEnrollment.hasMany(models.BenefitClaim, {
      as: 'claims',
      foreignKey: 'benefit_enrollment_id',
    });
  };

  return BenefitEnrollment;
};
