'use strict';

const { DataTypes } = require('sequelize');
const { PAYSLIP_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Payslip = sequelize.define(
    'Payslip',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      payrun_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      contract_id: { type: DataTypes.UUID, allowNull: true },
      salary_structure_id: { type: DataTypes.UUID, allowNull: true },
      code: { type: DataTypes.STRING(80), allowNull: false },
      period_start: { type: DataTypes.DATEONLY, allowNull: false },
      period_end: { type: DataTypes.DATEONLY, allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      worked_days: { type: DataTypes.DECIMAL(9, 2), allowNull: true },
      worked_hours: { type: DataTypes.DECIMAL(9, 2), allowNull: true },
      basic_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      allowances_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      deductions_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      gross_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      tax_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      contribution_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      net_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      advance_recovery_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM(...Object.values(PAYSLIP_STATUS)),
        allowNull: false,
        defaultValue: PAYSLIP_STATUS.DRAFT,
      },
      warnings: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      computed_at: { type: DataTypes.DATE, allowNull: true },
      validated_at: { type: DataTypes.DATE, allowNull: true },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      sent_at: { type: DataTypes.DATE, allowNull: true },
      pdf_path: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'payslips',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['payrun_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['payrun_id', 'employee_id'], unique: true },
      ],
    }
  );

  Payslip.associate = (models) => {
    Payslip.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Payslip.belongsTo(models.Payrun, { as: 'payrun', foreignKey: 'payrun_id' });
    Payslip.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    Payslip.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contract_id' });
    Payslip.belongsTo(models.SalaryStructure, { as: 'salary_structure', foreignKey: 'salary_structure_id' });
    Payslip.hasMany(models.PayslipLine, { as: 'lines', foreignKey: 'payslip_id' });
  };

  return Payslip;
};
