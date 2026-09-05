'use strict';

const { DataTypes } = require('sequelize');
const { PAYMENT_METHOD_TYPE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const PaymentMethod = sequelize.define(
    'PaymentMethod',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      method_type: {
        type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD_TYPE)),
        allowNull: false,
      },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      account_holder_name: { type: DataTypes.STRING(200), allowNull: true },
      account_number: { type: DataTypes.STRING(120), allowNull: true },
      routing_number: { type: DataTypes.STRING(80), allowNull: true },
      bank_name: { type: DataTypes.STRING(150), allowNull: true },
      iban: { type: DataTypes.STRING(50), allowNull: true },
      swift_bic: { type: DataTypes.STRING(20), allowNull: true },
      country_code: { type: DataTypes.STRING(2), allowNull: true },
      details: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'payment_methods',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['is_primary'] },
      ],
    }
  );

  PaymentMethod.associate = (models) => {
    PaymentMethod.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
  };

  return PaymentMethod;
};
