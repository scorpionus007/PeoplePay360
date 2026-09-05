'use strict';

const { DataTypes } = require('sequelize');
const { CHANGE_REQUEST_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const SalaryChangeRequest = sequelize.define(
    'SalaryChangeRequest',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      current_contract_id: { type: DataTypes.UUID, allowNull: true },
      change_type: {
        type: DataTypes.ENUM('increment', 'decrement'),
        allowNull: false,
      },
      suggested_by: { type: DataTypes.UUID, allowNull: false },
      suggested_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      suggested_percent: { type: DataTypes.DECIMAL(9, 4), allowNull: true },
      suggested_reason: { type: DataTypes.STRING(1000), allowNull: false },
      payroll_reviewer_id: { type: DataTypes.UUID, allowNull: true },
      payroll_decided_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      payroll_decision_note: { type: DataTypes.STRING(1000), allowNull: true },
      payroll_decided_at: { type: DataTypes.DATE, allowNull: true },
      admin_reviewer_id: { type: DataTypes.UUID, allowNull: true },
      admin_decision_note: { type: DataTypes.STRING(1000), allowNull: true },
      admin_decided_at: { type: DataTypes.DATE, allowNull: true },
      effective_from: { type: DataTypes.DATEONLY, allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(CHANGE_REQUEST_STATUS)),
        allowNull: false,
        defaultValue: CHANGE_REQUEST_STATUS.PENDING_PAYROLL_REVIEW,
      },
      applied_contract_id: { type: DataTypes.UUID, allowNull: true },
      applied_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'salary_change_requests',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
      ],
    }
  );

  SalaryChangeRequest.associate = (models) => {
    SalaryChangeRequest.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    SalaryChangeRequest.belongsTo(models.Contract, {
      as: 'current_contract',
      foreignKey: 'current_contract_id',
    });
    SalaryChangeRequest.belongsTo(models.Contract, {
      as: 'applied_contract',
      foreignKey: 'applied_contract_id',
    });
  };

  return SalaryChangeRequest;
};
