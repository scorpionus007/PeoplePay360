'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LoanRepayment = sequelize.define(
    'LoanRepayment',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      loan_id: { type: DataTypes.UUID, allowNull: false },
      payslip_id: { type: DataTypes.UUID, allowNull: true },
      mode: {
        type: DataTypes.ENUM('salary_deduction', 'direct_transfer', 'external'),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      recorded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      external_reference: { type: DataTypes.STRING(200), allowNull: true },
      note: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'loan_repayments',
      indexes: [{ fields: ['loan_id'] }, { fields: ['payslip_id'] }],
    }
  );

  LoanRepayment.associate = (models) => {
    LoanRepayment.belongsTo(models.Loan, { as: 'loan', foreignKey: 'loan_id' });
  };

  return LoanRepayment;
};
