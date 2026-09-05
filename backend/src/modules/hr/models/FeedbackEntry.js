'use strict';

const { DataTypes } = require('sequelize');
const { FEEDBACK_CATEGORY, FEEDBACK_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const FeedbackEntry = sequelize.define(
    'FeedbackEntry',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      // employee_id is null when submitted anonymously.
      employee_id: { type: DataTypes.UUID, allowNull: true },
      is_anonymous: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      category: {
        type: DataTypes.ENUM(...Object.values(FEEDBACK_CATEGORY)),
        allowNull: false,
        defaultValue: FEEDBACK_CATEGORY.OTHER,
      },
      subject: { type: DataTypes.STRING(200), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      sentiment_score: { type: DataTypes.DECIMAL(4, 3), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(FEEDBACK_STATUS)),
        allowNull: false,
        defaultValue: FEEDBACK_STATUS.NEW,
      },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'normal',
      },
      handled_by: { type: DataTypes.UUID, allowNull: true },
      resolution_note: { type: DataTypes.STRING(2000), allowNull: true },
      resolved_at: { type: DataTypes.DATE, allowNull: true },
      escalated_at: { type: DataTypes.DATE, allowNull: true },
      // Salted, non reversible reporter hash for anonymous submissions so HR
      // can identify duplicate spam without knowing who submitted.
      anonymous_fingerprint: { type: DataTypes.STRING(128), allowNull: true },
    },
    {
      tableName: 'feedback_entries',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['status'] },
        { fields: ['category'] },
        { fields: ['priority'] },
      ],
    }
  );

  FeedbackEntry.associate = (models) => {
    FeedbackEntry.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
  };

  return FeedbackEntry;
};
