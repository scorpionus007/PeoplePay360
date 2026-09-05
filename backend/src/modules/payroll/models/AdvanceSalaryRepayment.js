'use strict';

const { DataTypes } = require('sequelize');
const { ADVANCE_SALARY_REPAYMENT_MODE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const AdvanceSalaryRepayment = sequelize.define(
    'AdvanceSalaryRepayment',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      advance_salary_request_id: { type: DataTypes.UUID, allowNull: false },
      payslip_id: { type: DataTypes.UUID, allowNull: true },
      mode: {
        type: DataTypes.ENUM(...Object.values(ADVANCE_SALARY_REPAYMENT_MODE)),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      recorded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      external_reference: { type: DataTypes.STRING(255), allowNull: true },
      note: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'advance_salary_repayments',
      indexes: [
        { fields: ['advance_salary_request_id'] },
        { fields: ['payslip_id'] },
      ],
    }
  );

  AdvanceSalaryRepayment.associate = (models) => {
    AdvanceSalaryRepayment.belongsTo(models.AdvanceSalaryRequest, {
      as: 'request',
      foreignKey: 'advance_salary_request_id',
    });
    AdvanceSalaryRepayment.belongsTo(models.Payslip, { as: 'payslip', foreignKey: 'payslip_id' });
  };

  return AdvanceSalaryRepayment;
};
