'use strict';

const { DataTypes } = require('sequelize');
const { INTERVIEW_TYPE, INTERVIEW_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const Interview = sequelize.define(
    'Interview',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      application_id: { type: DataTypes.UUID, allowNull: false },
      round_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      interview_type: {
        type: DataTypes.ENUM(...Object.values(INTERVIEW_TYPE)),
        allowNull: false,
        defaultValue: INTERVIEW_TYPE.VIDEO,
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      scheduled_start: { type: DataTypes.DATE, allowNull: false },
      scheduled_end: { type: DataTypes.DATE, allowNull: false },
      timezone: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'UTC' },
      location: { type: DataTypes.STRING(500), allowNull: true },
      video_url: { type: DataTypes.STRING(1000), allowNull: true },
      panelists: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      status: {
        type: DataTypes.ENUM(...Object.values(INTERVIEW_STATUS)),
        allowNull: false,
        defaultValue: INTERVIEW_STATUS.SCHEDULED,
      },
      candidate_confirmed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      cancellation_reason: { type: DataTypes.STRING(500), allowNull: true },
      note: { type: DataTypes.STRING(1000), allowNull: true },
      scheduled_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: 'hiring_interviews',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['application_id'] },
        { fields: ['status'] },
        { fields: ['scheduled_start'] },
      ],
    }
  );

  Interview.associate = (models) => {
    Interview.belongsTo(models.Application, { as: 'application', foreignKey: 'application_id' });
    Interview.hasMany(models.InterviewFeedback, { as: 'feedback', foreignKey: 'interview_id' });
  };

  return Interview;
};
