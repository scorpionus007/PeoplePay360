'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: { type: DataTypes.UUID, allowNull: false },
      token_id: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      token_hash: { type: DataTypes.STRING(255), allowNull: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
      replaced_by_token_id: { type: DataTypes.STRING(64), allowNull: true },
      ip_address: { type: DataTypes.STRING(64), allowNull: true },
      user_agent: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'refresh_tokens',
      indexes: [{ fields: ['user_id'] }, { fields: ['token_id'], unique: true }],
    }
  );

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
  };

  return RefreshToken;
};
