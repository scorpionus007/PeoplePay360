'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
    },
    { tableName: 'permissions' }
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      as: 'roles',
      foreignKey: 'permission_id',
      otherKey: 'role_id',
    });
  };

  return Permission;
};
