'use strict';

const { DataTypes } = require('sequelize');
const { JOB_POSTING_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const JobPosting = sequelize.define(
    'JobPosting',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      requisition_id: { type: DataTypes.UUID, allowNull: false },
      job_board_id: { type: DataTypes.UUID, allowNull: true },
      channel: {
        type: DataTypes.ENUM('careers_site', 'linkedin', 'indeed', 'glassdoor', 'monster', 'naukri', 'wellfound', 'referral_only', 'custom'),
        allowNull: false,
        defaultValue: 'careers_site',
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      slug: { type: DataTypes.STRING(200), allowNull: true },
      external_reference: { type: DataTypes.STRING(200), allowNull: true },
      external_url: { type: DataTypes.STRING(1000), allowNull: true },
      published_content: { type: DataTypes.TEXT, allowNull: true },
      published_at: { type: DataTypes.DATE, allowNull: true },
      closed_at: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(JOB_POSTING_STATUS)),
        allowNull: false,
        defaultValue: JOB_POSTING_STATUS.DRAFT,
      },
      applications_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'hiring_job_postings',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['requisition_id'] },
        { fields: ['status'] },
        { fields: ['channel'] },
      ],
    }
  );

  JobPosting.associate = (models) => {
    JobPosting.belongsTo(models.Requisition, { as: 'requisition', foreignKey: 'requisition_id' });
    JobPosting.belongsTo(models.JobBoardIntegration, { as: 'board', foreignKey: 'job_board_id' });
    JobPosting.hasMany(models.Application, { as: 'applications', foreignKey: 'job_posting_id' });
  };

  return JobPosting;
};
