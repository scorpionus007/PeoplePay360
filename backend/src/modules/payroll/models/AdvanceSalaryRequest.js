'use strict';

const { DataTypes } = require('sequelize');
const {
  ADVANCE_SALARY_STATUS,
  ADVANCE_SALARY_REPAYMENT_MODE,
} = require('../../../config/constants');

module.exports = (sequelize) => {
  const AdvanceSalaryRequest = sequelize.define(
    'AdvanceSalaryRequest',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      contract_id: { type: DataTypes.UUID, allowNull: true },
      requested_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      approved_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      service_fee_percent: { type: DataTypes.DECIMAL(9, 4), allowNull: false, defaultValue: 0 },
      service_fee_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      disbursement_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      repayment_mode: {
        type: DataTypes.ENUM(...Object.values(ADVANCE_SALARY_REPAYMENT_MODE)),
        allowNull: false,
        defaultValue: ADVANCE_SALARY_REPAYMENT_MODE.SALARY_DEDUCTION,
      },
      emi_months: { type: DataTypes.INTEGER, allowNull: true },
      recovery_start_period: { type: DataTypes.DATEONLY, allowNull: true },
      outstanding_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      reason: { type: DataTypes.STRING(1000), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(ADVANCE_SALARY_STATUS)),
        allowNull: false,
        defaultValue: ADVANCE_SALARY_STATUS.REQUESTED,
      },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      disbursed_by: { type: DataTypes.UUID, allowNull: true },
      disbursed_at: { type: DataTypes.DATE, allowNull: true },
      settled_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'advance_salary_requests',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
      ],
    }
  );

  AdvanceSalaryRequest.associate = (models) => {
    AdvanceSalaryRequest.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    AdvanceSalaryRequest.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contract_id' });
    AdvanceSalaryRequest.hasMany(models.AdvanceSalaryRepayment, {
      as: 'repayments',
      foreignKey: 'advance_salary_request_id',
    });
  };

  return AdvanceSalaryRequest;
};
