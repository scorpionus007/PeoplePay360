'use strict';

const { DataTypes } = require('sequelize');
const { LOAN_STATUS, LOAN_INTEREST_MODE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Loan = sequelize.define(
    'Loan',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      loan_program_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      requested_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      approved_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      tenure_months: { type: DataTypes.INTEGER, allowNull: false },
      interest_mode: {
        type: DataTypes.ENUM(...Object.values(LOAN_INTEREST_MODE)),
        allowNull: false,
        defaultValue: LOAN_INTEREST_MODE.ZERO,
      },
      interest_rate_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
      processing_fee_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      monthly_installment: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      total_repayable: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      outstanding_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      salary_deduction: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      reason: { type: DataTypes.STRING(1000), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(LOAN_STATUS)),
        allowNull: false,
        defaultValue: LOAN_STATUS.SUBMITTED,
      },
      manager_reviewer_id: { type: DataTypes.UUID, allowNull: true },
      manager_reviewed_at: { type: DataTypes.DATE, allowNull: true },
      manager_note: { type: DataTypes.STRING(1000), allowNull: true },
      admin_reviewer_id: { type: DataTypes.UUID, allowNull: true },
      admin_reviewed_at: { type: DataTypes.DATE, allowNull: true },
      admin_note: { type: DataTypes.STRING(1000), allowNull: true },
      disbursed_at: { type: DataTypes.DATE, allowNull: true },
      disbursed_by: { type: DataTypes.UUID, allowNull: true },
      closed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'loans',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['loan_program_id'] },
        { fields: ['status'] },
        { fields: ['organization_id', 'code'], unique: true },
      ],
    }
  );

  Loan.associate = (models) => {
    Loan.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    Loan.belongsTo(models.LoanProgram, { as: 'program', foreignKey: 'loan_program_id' });
    Loan.hasMany(models.LoanRepayment, { as: 'repayments', foreignKey: 'loan_id' });
  };

  return Loan;
};
