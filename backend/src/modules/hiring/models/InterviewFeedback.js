'use strict';

const { DataTypes } = require('sequelize');
const { INTERVIEW_RECOMMENDATION } = require('../../../config/constants');

module.exports = (sequelize) => {
  const InterviewFeedback = sequelize.define(
    'InterviewFeedback',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      interview_id: { type: DataTypes.UUID, allowNull: false },
      panelist_user_id: { type: DataTypes.UUID, allowNull: false },
      panelist_role: { type: DataTypes.STRING(80), allowNull: true },
      overall_rating: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
      recommendation: {
        type: DataTypes.ENUM(...Object.values(INTERVIEW_RECOMMENDATION)),
        allowNull: false,
      },
      strengths: { type: DataTypes.TEXT, allowNull: true },
      concerns: { type: DataTypes.TEXT, allowNull: true },
      questions_asked: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      criteria_scores: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'hiring_interview_feedback',
      indexes: [
        { fields: ['interview_id'] },
        { fields: ['panelist_user_id'] },
        { fields: ['interview_id', 'panelist_user_id'], unique: true },
      ],
    }
  );

  InterviewFeedback.associate = (models) => {
    InterviewFeedback.belongsTo(models.Interview, { as: 'interview', foreignKey: 'interview_id' });
  };

  return InterviewFeedback;
};
