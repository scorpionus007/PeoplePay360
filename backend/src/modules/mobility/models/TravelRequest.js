'use strict';

const { DataTypes } = require('sequelize');
const { TRAVEL_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const TravelRequest = sequelize.define(
    'TravelRequest',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: false },
      purpose: { type: DataTypes.STRING(500), allowNull: false },
      trip_type: {
        type: DataTypes.ENUM('business', 'client_visit', 'training', 'conference', 'onboarding', 'relocation', 'other'),
        allowNull: false,
        defaultValue: 'business',
      },
      from_country_code: { type: DataTypes.STRING(2), allowNull: true },
      from_city: { type: DataTypes.STRING(120), allowNull: true },
      to_country_code: { type: DataTypes.STRING(2), allowNull: false },
      to_city: { type: DataTypes.STRING(120), allowNull: true },
      depart_date: { type: DataTypes.DATEONLY, allowNull: false },
      return_date: { type: DataTypes.DATEONLY, allowNull: false },
      estimated_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      actual_cost: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      requires_visa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      status: {
        type: DataTypes.ENUM(...Object.values(TRAVEL_STATUS)),
        allowNull: false,
        defaultValue: TRAVEL_STATUS.DRAFT,
      },
      approver_id: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      approval_note: { type: DataTypes.STRING(1000), allowNull: true },
      booking_reference: { type: DataTypes.STRING(200), allowNull: true },
      itinerary: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'mobility_travel_requests',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['depart_date'] },
        { fields: ['organization_id', 'code'], unique: true },
      ],
    }
  );

  TravelRequest.associate = (models) => {
    TravelRequest.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
  };

  return TravelRequest;
};
