'use strict';

const { DataTypes } = require('sequelize');
const { APPLICATION_STAGE, APPLICATION_SOURCE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Application = sequelize.define(
    'Application',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      candidate_id: { type: DataTypes.UUID, allowNull: false },
      requisition_id: { type: DataTypes.UUID, allowNull: false },
      job_posting_id: { type: DataTypes.UUID, allowNull: true },
      referral_id: { type: DataTypes.UUID, allowNull: true },
      source: {
        type: DataTypes.ENUM(...Object.values(APPLICATION_SOURCE)),
        allowNull: false,
        defaultValue: APPLICATION_SOURCE.DIRECT,
      },
      current_stage: {
        type: DataTypes.ENUM(...Object.values(APPLICATION_STAGE)),
        allowNull: false,
        defaultValue: APPLICATION_STAGE.APPLIED,
      },
      applied_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      rejected_at: { type: DataTypes.DATE, allowNull: true },
      rejection_reason: { type: DataTypes.STRING(1000), allowNull: true },
      internal_rating: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
      cover_letter_url: { type: DataTypes.STRING(1000), allowNull: true },
      assigned_recruiter_id: { type: DataTypes.UUID, allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'hiring_applications',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['candidate_id'] },
        { fields: ['requisition_id'] },
        { fields: ['job_posting_id'] },
        { fields: ['current_stage'] },
        { fields: ['candidate_id', 'requisition_id'], unique: true },
      ],
    }
  );

  Application.associate = (models) => {
    Application.belongsTo(models.Candidate, { as: 'candidate', foreignKey: 'candidate_id' });
    Application.belongsTo(models.Requisition, { as: 'requisition', foreignKey: 'requisition_id' });
    Application.belongsTo(models.JobPosting, { as: 'posting', foreignKey: 'job_posting_id' });
    Application.belongsTo(models.Referral, { as: 'referral', foreignKey: 'referral_id' });
    Application.hasMany(models.ApplicationStageHistory, {
      as: 'stage_history',
      foreignKey: 'application_id',
    });
    Application.hasMany(models.Interview, { as: 'interviews', foreignKey: 'application_id' });
    Application.hasMany(models.Offer, { as: 'offers', foreignKey: 'application_id' });
  };

  return Application;
};
