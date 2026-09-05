'use strict';

const { DataTypes } = require('sequelize');
const { PAYRUN_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Payrun = sequelize.define(
    'Payrun',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      salary_structure_id: { type: DataTypes.UUID, allowNull: true },
      period_start: { type: DataTypes.DATEONLY, allowNull: false },
      period_end: { type: DataTypes.DATEONLY, allowNull: false },
      payment_date: { type: DataTypes.DATEONLY, allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: {
        type: DataTypes.ENUM(...Object.values(PAYRUN_STATUS)),
        allowNull: false,
        defaultValue: PAYRUN_STATUS.DRAFT,
      },
      department_scope: { type: DataTypes.JSONB, allowNull: true },
      employee_type_scope: { type: DataTypes.JSONB, allowNull: true },
      warnings: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      totals: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      created_by: { type: DataTypes.UUID, allowNull: true },
      validated_by: { type: DataTypes.UUID, allowNull: true },
      validated_at: { type: DataTypes.DATE, allowNull: true },
      released_by: { type: DataTypes.UUID, allowNull: true },
      released_at: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {
      tableName: 'payruns',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true },
        { fields: ['status'] },
        { fields: ['period_start', 'period_end'] },
      ],
    }
  );

  Payrun.associate = (models) => {
    Payrun.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Payrun.belongsTo(models.SalaryStructure, {
      as: 'salary_structure',
      foreignKey: 'salary_structure_id',
    });
    Payrun.hasMany(models.Payslip, { as: 'payslips', foreignKey: 'payrun_id' });
  };

  return Payrun;
};
