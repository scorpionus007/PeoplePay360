'use strict';

const { DataTypes } = require('sequelize');
const { LOAN_INTEREST_MODE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const LoanProgram = sequelize.define(
    'LoanProgram',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(2000), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      min_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      max_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      min_tenure_months: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      max_tenure_months: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 24 },
      interest_mode: {
        type: DataTypes.ENUM(...Object.values(LOAN_INTEREST_MODE)),
        allowNull: false,
        defaultValue: LOAN_INTEREST_MODE.ZERO,
      },
      interest_rate_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
      processing_fee_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
      requires_manager_approval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      requires_admin_approval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      salary_deduction_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'loan_programs',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
      ],
    }
  );

  LoanProgram.associate = (models) => {
    LoanProgram.hasMany(models.Loan, { as: 'loans', foreignKey: 'loan_program_id' });
  };

  return LoanProgram;
};
