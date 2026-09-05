'use strict';

const { DataTypes } = require('sequelize');
const { IMMIGRATION_CASE_TYPE, IMMIGRATION_CASE_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const ImmigrationCase = sequelize.define(
    'ImmigrationCase',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      mobility_partner_id: { type: DataTypes.UUID, allowNull: true },
      case_code: { type: DataTypes.STRING(80), allowNull: false },
      case_type: {
        type: DataTypes.ENUM(...Object.values(IMMIGRATION_CASE_TYPE)),
        allowNull: false,
      },
      country_code: { type: DataTypes.STRING(2), allowNull: false },
      status: {
        type: DataTypes.ENUM(...Object.values(IMMIGRATION_CASE_STATUS)),
        allowNull: false,
        defaultValue: IMMIGRATION_CASE_STATUS.OPEN,
      },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
      },
      dependents_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      opened_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      next_action_due: { type: DataTypes.DATEONLY, allowNull: true },
      resolved_at: { type: DataTypes.DATE, allowNull: true },
      summary: { type: DataTypes.STRING(2000), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      assigned_to: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'mobility_immigration_cases',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['organization_id', 'case_code'], unique: true },
      ],
    }
  );

  ImmigrationCase.associate = (models) => {
    ImmigrationCase.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    ImmigrationCase.belongsTo(models.MobilityPartner, {
      as: 'partner',
      foreignKey: 'mobility_partner_id',
    });
  };

  return ImmigrationCase;
};
