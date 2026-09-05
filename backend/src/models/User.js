'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: true },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      full_name: { type: DataTypes.STRING(200), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      last_login_at: { type: DataTypes.DATE, allowNull: true },
      mfa_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'users',
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
      scopes: {
        withPassword: { attributes: { include: ['password_hash'] } },
      },
      indexes: [{ fields: ['organization_id'] }],
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    User.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      as: 'roles',
      foreignKey: 'user_id',
      otherKey: 'role_id',
    });
    User.hasMany(models.RefreshToken, { as: 'refresh_tokens', foreignKey: 'user_id' });
  };

  return User;
};
