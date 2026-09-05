'use strict';

const { DataTypes } = require('sequelize');
const { SALARY_RULE_CATEGORY } = require('../../../config/constants');

module.exports = (sequelize) => {
  const PayslipLine = sequelize.define(
    'PayslipLine',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      payslip_id: { type: DataTypes.UUID, allowNull: false },
      salary_rule_id: { type: DataTypes.UUID, allowNull: true },
      sequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
      rule_code: { type: DataTypes.STRING(80), allowNull: false },
      rule_name: { type: DataTypes.STRING(200), allowNull: false },
      category: {
        type: DataTypes.ENUM(...Object.values(SALARY_RULE_CATEGORY)),
        allowNull: false,
      },
      quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 1 },
      rate: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      note: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'payslip_lines',
      indexes: [{ fields: ['payslip_id'] }, { fields: ['category'] }, { fields: ['sequence'] }],
    }
  );

  PayslipLine.associate = (models) => {
    PayslipLine.belongsTo(models.Payslip, { as: 'payslip', foreignKey: 'payslip_id' });
    PayslipLine.belongsTo(models.SalaryRule, { as: 'rule', foreignKey: 'salary_rule_id' });
  };

  return PayslipLine;
};
