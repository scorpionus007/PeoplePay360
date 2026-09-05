'use strict';

const { DataTypes } = require('sequelize');
const { RELOCATION_STATUS, RELOCATION_BUDGET_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const RelocationCase = sequelize.define(
    'RelocationCase',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      mobility_partner_id: { type: DataTypes.UUID, allowNull: true },
      case_code: { type: DataTypes.STRING(80), allowNull: false },
      from_country_code: { type: DataTypes.STRING(2), allowNull: false },
      from_city: { type: DataTypes.STRING(120), allowNull: true },
      to_country_code: { type: DataTypes.STRING(2), allowNull: false },
      to_city: { type: DataTypes.STRING(120), allowNull: true },
      reason: {
        type: DataTypes.ENUM('new_role', 'transfer', 'promotion', 'return_home', 'other'),
        allowNull: false,
        defaultValue: 'new_role',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(RELOCATION_STATUS)),
        allowNull: false,
        defaultValue: RELOCATION_STATUS.REQUESTED,
      },
      budget_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      budget_currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      spent_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false, defaultValue: 0 },
      budget_status: {
        type: DataTypes.ENUM(...Object.values(RELOCATION_BUDGET_STATUS)),
        allowNull: false,
        defaultValue: RELOCATION_BUDGET_STATUS.DRAFT,
      },
      target_move_date: { type: DataTypes.DATEONLY, allowNull: true },
      actual_move_date: { type: DataTypes.DATEONLY, allowNull: true },
      dependents_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      requested_by: { type: DataTypes.UUID, allowNull: true },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      approval_note: { type: DataTypes.STRING(1000), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'mobility_relocation_cases',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['organization_id', 'case_code'], unique: true },
      ],
    }
  );

  RelocationCase.associate = (models) => {
    RelocationCase.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    RelocationCase.belongsTo(models.MobilityPartner, {
      as: 'partner',
      foreignKey: 'mobility_partner_id',
    });
    RelocationCase.hasMany(models.RelocationExpense, {
      as: 'expenses',
      foreignKey: 'relocation_case_id',
    });
  };

  return RelocationCase;
};
