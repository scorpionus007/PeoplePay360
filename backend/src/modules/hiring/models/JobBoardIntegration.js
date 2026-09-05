'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobBoardIntegration = sequelize.define(
    'JobBoardIntegration',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      vendor: {
        type: DataTypes.ENUM('linkedin', 'indeed', 'glassdoor', 'monster', 'naukri', 'wellfound', 'custom'),
        allowNull: false,
      },
      display_name: { type: DataTypes.STRING(200), allowNull: false },
      api_base_url: { type: DataTypes.STRING(500), allowNull: true },
      credentials_ref: { type: DataTypes.STRING(255), allowNull: true },
      settings: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      status: {
        type: DataTypes.ENUM('connected', 'degraded', 'disconnected', 'error'),
        allowNull: false,
        defaultValue: 'disconnected',
      },
      last_synced_at: { type: DataTypes.DATE, allowNull: true },
      last_error: { type: DataTypes.STRING(1000), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'hiring_job_boards',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'vendor'] },
      ],
    }
  );

  JobBoardIntegration.associate = (models) => {
    JobBoardIntegration.hasMany(models.JobPosting, { as: 'postings', foreignKey: 'job_board_id' });
  };

  return JobBoardIntegration;
};
