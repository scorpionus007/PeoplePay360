'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PayrollTransaction = sequelize.define(
    'PayrollTransaction',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      payslip_id: { type: DataTypes.UUID, allowNull: true },
      payrun_id: { type: DataTypes.UUID, allowNull: true },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      payment_method_id: { type: DataTypes.UUID, allowNull: true },
      transaction_type: {
        type: DataTypes.ENUM('salary', 'bonus', 'advance_disbursement', 'advance_recovery', 'adjustment'),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      fx_rate_to_base: { type: DataTypes.DECIMAL(18, 8), allowNull: true },
      base_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'reversed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      external_reference: { type: DataTypes.STRING(255), allowNull: true },
      failure_reason: { type: DataTypes.STRING(1000), allowNull: true },
      initiated_by: { type: DataTypes.UUID, allowNull: true },
      initiated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      completed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'payroll_transactions',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['payslip_id'] },
        { fields: ['status'] },
        { fields: ['transaction_type'] },
      ],
    }
  );

  PayrollTransaction.associate = (models) => {
    PayrollTransaction.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    PayrollTransaction.belongsTo(models.Payslip, { as: 'payslip', foreignKey: 'payslip_id' });
    PayrollTransaction.belongsTo(models.Payrun, { as: 'payrun', foreignKey: 'payrun_id' });
    PayrollTransaction.belongsTo(models.PaymentMethod, {
      as: 'payment_method',
      foreignKey: 'payment_method_id',
    });
  };

  return PayrollTransaction;
};
