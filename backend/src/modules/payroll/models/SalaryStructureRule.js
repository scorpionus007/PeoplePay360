'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalaryStructureRule = sequelize.define(
    'SalaryStructureRule',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      salary_structure_id: { type: DataTypes.UUID, allowNull: false },
      salary_rule_id: { type: DataTypes.UUID, allowNull: false },
      sequence: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
      override_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      override_percent: { type: DataTypes.DECIMAL(9, 4), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'salary_structure_rules',
      indexes: [
        { fields: ['salary_structure_id'] },
        { fields: ['salary_structure_id', 'salary_rule_id'], unique: true },
        { fields: ['sequence'] },
      ],
    }
  );

  SalaryStructureRule.associate = (models) => {
    SalaryStructureRule.belongsTo(models.SalaryStructure, {
      as: 'structure',
      foreignKey: 'salary_structure_id',
    });
    SalaryStructureRule.belongsTo(models.SalaryRule, {
      as: 'rule',
      foreignKey: 'salary_rule_id',
    });
  };

  return SalaryStructureRule;
};
