'use strict';

const { DataTypes } = require('sequelize');
const { CHAT_SENDER_TYPE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const HRRequestMessage = sequelize.define(
    'HRRequestMessage',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      hr_request_id: { type: DataTypes.UUID, allowNull: false },
      sender_user_id: { type: DataTypes.UUID, allowNull: true },
      sender_type: {
        type: DataTypes.ENUM(...Object.values(CHAT_SENDER_TYPE)),
        allowNull: false,
      },
      body: { type: DataTypes.TEXT, allowNull: false },
      internal_note: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_ai_generated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      read_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'hr_request_messages',
      indexes: [{ fields: ['hr_request_id'] }, { fields: ['sender_user_id'] }],
    }
  );

  HRRequestMessage.associate = (models) => {
    HRRequestMessage.belongsTo(models.HRRequest, { as: 'request', foreignKey: 'hr_request_id' });
    HRRequestMessage.belongsTo(models.User, { as: 'sender', foreignKey: 'sender_user_id' });
  };

  return HRRequestMessage;
};
