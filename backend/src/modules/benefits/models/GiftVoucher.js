'use strict';

const { DataTypes } = require('sequelize');
const { VOUCHER_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const GiftVoucher = sequelize.define(
    'GiftVoucher',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: true },
      code: { type: DataTypes.STRING(80), allowNull: false },
      partner_name: { type: DataTypes.STRING(150), allowNull: true },
      category: { type: DataTypes.STRING(80), allowNull: true },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: {
        type: DataTypes.ENUM(...Object.values(VOUCHER_STATUS)),
        allowNull: false,
        defaultValue: VOUCHER_STATUS.ISSUED,
      },
      valid_from: { type: DataTypes.DATEONLY, allowNull: true },
      valid_to: { type: DataTypes.DATEONLY, allowNull: true },
      issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      issued_by: { type: DataTypes.UUID, allowNull: true },
      delivered_at: { type: DataTypes.DATE, allowNull: true },
      redeemed_at: { type: DataTypes.DATE, allowNull: true },
      redemption_reference: { type: DataTypes.STRING(200), allowNull: true },
      note: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'gift_vouchers',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['organization_id', 'code'], unique: true },
      ],
    }
  );

  GiftVoucher.associate = (models) => {
    GiftVoucher.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
  };

  return GiftVoucher;
};
