'use strict';

const { DataTypes } = require('sequelize');
const { CONTRACT_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Contract = sequelize.define(
    'Contract',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      salary_structure_id: { type: DataTypes.UUID, allowNull: true },
      working_schedule_id: { type: DataTypes.UUID, allowNull: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      department: { type: DataTypes.STRING(150), allowNull: true },
      position: { type: DataTypes.STRING(150), allowNull: true },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: true },
      wage_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      wage_currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      wage_period: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly',
      },
      probation_end_date: { type: DataTypes.DATEONLY, allowNull: true },
      notice_period_days: { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(CONTRACT_STATUS)),
        allowNull: false,
        defaultValue: CONTRACT_STATUS.DRAFT,
      },
      terms: { type: DataTypes.TEXT, allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'contracts',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['start_date'] },
        { fields: ['end_date'] },
      ],
    }
  );

  Contract.associate = (models) => {
    Contract.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Contract.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    Contract.belongsTo(models.SalaryStructure, {
      as: 'salary_structure',
      foreignKey: 'salary_structure_id',
    });
  };

  return Contract;
};
