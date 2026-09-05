'use strict';

const { DataTypes } = require('sequelize');
const { BONUS_TYPE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BonusRecord = sequelize.define(
    'BonusRecord',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      contract_id: { type: DataTypes.UUID, allowNull: true },
      bonus_type: {
        type: DataTypes.ENUM(...Object.values(BONUS_TYPE)),
        allowNull: false,
        defaultValue: BONUS_TYPE.DISCRETIONARY,
      },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      taxable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      grant_date: { type: DataTypes.DATEONLY, allowNull: false },
      payout_period: { type: DataTypes.DATEONLY, allowNull: true },
      reason: { type: DataTypes.STRING(1000), allowNull: true },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      payslip_id: { type: DataTypes.UUID, allowNull: true },
      status: {
        type: DataTypes.ENUM('draft', 'approved', 'paid', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
    },
    {
      tableName: 'bonus_records',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
      ],
    }
  );

  BonusRecord.associate = (models) => {
    BonusRecord.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    BonusRecord.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contract_id' });
    BonusRecord.belongsTo(models.Payslip, { as: 'payslip', foreignKey: 'payslip_id' });
  };

  return BonusRecord;
};
