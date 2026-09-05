'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RelocationExpense = sequelize.define(
    'RelocationExpense',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      relocation_case_id: { type: DataTypes.UUID, allowNull: false },
      category: {
        type: DataTypes.ENUM('flights', 'shipping', 'housing', 'temporary_stay', 'visa_fees', 'legal', 'transport', 'per_diem', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
      description: { type: DataTypes.STRING(500), allowNull: false },
      amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      incurred_on: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'reimbursed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      receipt_url: { type: DataTypes.STRING(1000), allowNull: true },
      reviewed_by: { type: DataTypes.UUID, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      note: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {
      tableName: 'mobility_relocation_expenses',
      indexes: [
        { fields: ['relocation_case_id'] },
        { fields: ['status'] },
      ],
    }
  );

  RelocationExpense.associate = (models) => {
    RelocationExpense.belongsTo(models.RelocationCase, {
      as: 'relocation_case',
      foreignKey: 'relocation_case_id',
    });
  };

  return RelocationExpense;
};
