'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      key: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.STRING(500), allowNull: true },
      is_system: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'roles' }
  );

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      as: 'users',
      foreignKey: 'role_id',
      otherKey: 'user_id',
    });
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      as: 'permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
    });
  };

  return Role;
};
