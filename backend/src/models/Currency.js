'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Currency = sequelize.define(
    'Currency',
    {
      code: { type: DataTypes.STRING(3), primaryKey: true },
      name: { type: DataTypes.STRING(80), allowNull: false },
      symbol: { type: DataTypes.STRING(8), allowNull: true },
      minor_unit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'currencies', timestamps: false }
  );

  return Currency;
};
