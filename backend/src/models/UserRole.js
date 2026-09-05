'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      user_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      role_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      assigned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      assigned_by: { type: DataTypes.UUID, allowNull: true },
    },
    { tableName: 'user_roles', timestamps: false }
  );

  return UserRole;
};
