'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalaryStructure = sequelize.define(
    'SalaryStructure',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.STRING(1000), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      effective_from: { type: DataTypes.DATEONLY, allowNull: true },
      effective_to: { type: DataTypes.DATEONLY, allowNull: true },
      created_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'salary_structures',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
      ],
    }
  );

  SalaryStructure.associate = (models) => {
    SalaryStructure.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    SalaryStructure.hasMany(models.SalaryStructureRule, {
      as: 'structure_rules',
      foreignKey: 'salary_structure_id',
    });
    SalaryStructure.belongsToMany(models.SalaryRule, {
      through: models.SalaryStructureRule,
      as: 'rules',
      foreignKey: 'salary_structure_id',
      otherKey: 'salary_rule_id',
    });
    SalaryStructure.hasMany(models.Contract, { as: 'contracts', foreignKey: 'salary_structure_id' });
    SalaryStructure.hasMany(models.Payrun, { as: 'payruns', foreignKey: 'salary_structure_id' });
  };

  return SalaryStructure;
};
