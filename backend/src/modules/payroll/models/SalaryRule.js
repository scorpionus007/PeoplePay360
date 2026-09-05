'use strict';

const { DataTypes } = require('sequelize');
const { SALARY_RULE_CATEGORY, SALARY_RULE_COMPUTE_TYPE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const SalaryRule = sequelize.define(
    'SalaryRule',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(1000), allowNull: true },
      category: {
        type: DataTypes.ENUM(...Object.values(SALARY_RULE_CATEGORY)),
        allowNull: false,
      },
      compute_type: {
        type: DataTypes.ENUM(...Object.values(SALARY_RULE_COMPUTE_TYPE)),
        allowNull: false,
        defaultValue: SALARY_RULE_COMPUTE_TYPE.FIXED,
      },
      fixed_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      percent_value: { type: DataTypes.DECIMAL(9, 4), allowNull: true },
      percent_of_category: {
        type: DataTypes.ENUM(...Object.values(SALARY_RULE_CATEGORY)),
        allowNull: true,
      },
      formula: { type: DataTypes.STRING(2000), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      taxable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      appears_on_payslip: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'salary_rules',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
        { fields: ['category'] },
      ],
    }
  );

  SalaryRule.associate = (models) => {
    SalaryRule.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    SalaryRule.belongsToMany(models.SalaryStructure, {
      through: models.SalaryStructureRule,
      as: 'structures',
      foreignKey: 'salary_rule_id',
      otherKey: 'salary_structure_id',
    });
  };

  return SalaryRule;
};
