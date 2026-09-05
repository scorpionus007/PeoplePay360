'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExchangeRate = sequelize.define(
    'ExchangeRate',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      base_currency: { type: DataTypes.STRING(3), allowNull: false },
      quote_currency: { type: DataTypes.STRING(3), allowNull: false },
      rate: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
      as_of_date: { type: DataTypes.DATEONLY, allowNull: false },
      source: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'manual' },
    },
    {
      tableName: 'exchange_rates',
      indexes: [
        { fields: ['base_currency', 'quote_currency', 'as_of_date'], unique: true },
      ],
    }
  );

  return ExchangeRate;
};
