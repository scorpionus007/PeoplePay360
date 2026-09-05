'use strict';

const { DataTypes } = require('sequelize');
const { BENEFIT_CLAIM_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BenefitClaim = sequelize.define(
    'BenefitClaim',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      benefit_enrollment_id: { type: DataTypes.UUID, allowNull: false },
      benefit_plan_id: { type: DataTypes.UUID, allowNull: false },
      claim_code: { type: DataTypes.STRING(80), allowNull: false },
      subject: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      incurred_on: { type: DataTypes.DATEONLY, allowNull: false },
      claim_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      approved_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      reimbursed_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: {
        type: DataTypes.ENUM(...Object.values(BENEFIT_CLAIM_STATUS)),
        allowNull: false,
        defaultValue: BENEFIT_CLAIM_STATUS.SUBMITTED,
      },
      documents: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      review_note: { type: DataTypes.STRING(1000), allowNull: true },
      reviewed_by: { type: DataTypes.UUID, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      reimbursed_by: { type: DataTypes.UUID, allowNull: true },
      reimbursed_at: { type: DataTypes.DATE, allowNull: true },
      external_reference: { type: DataTypes.STRING(200), allowNull: true },
    },
    {
      tableName: 'benefit_claims',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['benefit_enrollment_id'] },
        { fields: ['status'] },
        { fields: ['incurred_on'] },
        { fields: ['organization_id', 'claim_code'], unique: true },
      ],
    }
  );

  BenefitClaim.associate = (models) => {
    BenefitClaim.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    BenefitClaim.belongsTo(models.BenefitEnrollment, {
      as: 'enrollment',
      foreignKey: 'benefit_enrollment_id',
    });
    BenefitClaim.belongsTo(models.BenefitPlan, { as: 'plan', foreignKey: 'benefit_plan_id' });
  };

  return BenefitClaim;
};
