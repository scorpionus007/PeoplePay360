'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Department = sequelize.define(
    'Department',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      parent_id: { type: DataTypes.UUID, allowNull: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      code: { type: DataTypes.STRING(50), allowNull: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'departments',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true, where: { code: { [require('sequelize').Op.ne]: null } } },
      ],
    }
  );

  Department.associate = (models) => {
    Department.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Department.belongsTo(models.Department, { as: 'parent', foreignKey: 'parent_id' });
    Department.hasMany(models.Department, { as: 'children', foreignKey: 'parent_id' });
    Department.hasMany(models.Employee, { as: 'employees', foreignKey: 'department_id' });
  };

  return Department;
};
