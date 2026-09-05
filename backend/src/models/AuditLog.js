'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      actor_user_id: { type: DataTypes.UUID, allowNull: true },
      organization_id: { type: DataTypes.UUID, allowNull: true },
      action: { type: DataTypes.STRING(120), allowNull: false },
      entity_type: { type: DataTypes.STRING(120), allowNull: false },
      entity_id: { type: DataTypes.STRING(120), allowNull: true },
      before_state: { type: DataTypes.JSONB, allowNull: true },
      after_state: { type: DataTypes.JSONB, allowNull: true },
      ip_address: { type: DataTypes.STRING(64), allowNull: true },
      user_agent: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'audit_logs',
      updatedAt: false,
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['actor_user_id'] },
        { fields: ['entity_type', 'entity_id'] },
        { fields: ['action'] },
      ],
    }
  );

  return AuditLog;
};
