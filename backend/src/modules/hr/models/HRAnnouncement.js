'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HRAnnouncement = sequelize.define(
    'HRAnnouncement',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      audience: {
        type: DataTypes.ENUM('all', 'department', 'role', 'custom'),
        allowNull: false,
        defaultValue: 'all',
      },
      audience_ref: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      is_pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      publish_at: { type: DataTypes.DATE, allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: true },
      published_by: { type: DataTypes.UUID, allowNull: true },
      status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      },
    },
    {
      tableName: 'hr_announcements',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['status'] },
        { fields: ['is_pinned'] },
      ],
    }
  );

  return HRAnnouncement;
};
