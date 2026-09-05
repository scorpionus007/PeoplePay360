'use strict';

const { DataTypes } = require('sequelize');
const { OFFER_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Offer = sequelize.define(
    'Offer',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      application_id: { type: DataTypes.UUID, allowNull: false },
      candidate_id: { type: DataTypes.UUID, allowNull: false },
      requisition_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: false },
      department_id: { type: DataTypes.UUID, allowNull: true },
      manager_id: { type: DataTypes.UUID, allowNull: true },
      base_salary: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      salary_period: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'yearly',
      },
      sign_on_bonus: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      annual_bonus_percent: { type: DataTypes.DECIMAL(6, 3), allowNull: true },
      equity_shares: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      equity_notes: { type: DataTypes.STRING(2000), allowNull: true },
      start_date: { type: DataTypes.DATEONLY, allowNull: true },
      probation_days: { type: DataTypes.INTEGER, allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: true },
      offer_letter_url: { type: DataTypes.STRING(1000), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(OFFER_STATUS)),
        allowNull: false,
        defaultValue: OFFER_STATUS.DRAFT,
      },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      approval_note: { type: DataTypes.STRING(1000), allowNull: true },
      extended_at: { type: DataTypes.DATE, allowNull: true },
      responded_at: { type: DataTypes.DATE, allowNull: true },
      response_note: { type: DataTypes.STRING(1000), allowNull: true },
      terms: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'hiring_offers',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['application_id'] },
        { fields: ['candidate_id'] },
        { fields: ['requisition_id'] },
        { fields: ['status'] },
      ],
    }
  );

  Offer.associate = (models) => {
    Offer.belongsTo(models.Application, { as: 'application', foreignKey: 'application_id' });
    Offer.belongsTo(models.Candidate, { as: 'candidate', foreignKey: 'candidate_id' });
    Offer.belongsTo(models.Requisition, { as: 'requisition', foreignKey: 'requisition_id' });
    Offer.belongsTo(models.Department, { as: 'department', foreignKey: 'department_id' });
  };

  return Offer;
};
