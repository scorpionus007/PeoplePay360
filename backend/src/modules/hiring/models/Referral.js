'use strict';

const { DataTypes } = require('sequelize');
const { REFERRAL_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Referral = sequelize.define(
    'Referral',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      referrer_employee_id: { type: DataTypes.UUID, allowNull: false },
      requisition_id: { type: DataTypes.UUID, allowNull: true },
      candidate_id: { type: DataTypes.UUID, allowNull: true },
      candidate_first_name: { type: DataTypes.STRING(100), allowNull: false },
      candidate_last_name: { type: DataTypes.STRING(100), allowNull: false },
      candidate_email: { type: DataTypes.STRING(200), allowNull: false },
      candidate_phone: { type: DataTypes.STRING(40), allowNull: true },
      candidate_resume_url: { type: DataTypes.STRING(1000), allowNull: true },
      relationship: { type: DataTypes.STRING(200), allowNull: true },
      recommendation: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(REFERRAL_STATUS)),
        allowNull: false,
        defaultValue: REFERRAL_STATUS.SUBMITTED,
      },
      bonus_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      bonus_currency: { type: DataTypes.STRING(3), allowNull: true },
      bonus_paid_at: { type: DataTypes.DATE, allowNull: true },
      reviewer_id: { type: DataTypes.UUID, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      review_note: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {
      tableName: 'hiring_referrals',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['referrer_employee_id'] },
        { fields: ['requisition_id'] },
        { fields: ['status'] },
      ],
    }
  );

  Referral.associate = (models) => {
    Referral.belongsTo(models.Employee, { as: 'referrer', foreignKey: 'referrer_employee_id' });
    Referral.belongsTo(models.Requisition, { as: 'requisition', foreignKey: 'requisition_id' });
    Referral.belongsTo(models.Candidate, { as: 'candidate', foreignKey: 'candidate_id' });
    Referral.hasMany(models.Application, { as: 'applications', foreignKey: 'referral_id' });
  };

  return Referral;
};
