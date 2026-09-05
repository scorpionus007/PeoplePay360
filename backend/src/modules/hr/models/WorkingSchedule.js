'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkingSchedule = sequelize.define(
    'WorkingSchedule',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      code: { type: DataTypes.STRING(80), allowNull: true },
      schedule_type: {
        type: DataTypes.ENUM('standard', 'flexible', 'shift', 'part_time', 'custom'),
        allowNull: false,
        defaultValue: 'standard',
      },
      timezone: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'UTC' },
      // Denormalized weekly hours computed from days for quick display.
      weekly_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: 'working_schedules',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'code'], unique: true, where: { code: { [require('sequelize').Op.ne]: null } } },
      ],
    }
  );

  WorkingSchedule.associate = (models) => {
    WorkingSchedule.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    WorkingSchedule.hasMany(models.WorkingScheduleDay, {
      as: 'days',
      foreignKey: 'working_schedule_id',
    });
    WorkingSchedule.hasMany(models.Employee, { as: 'employees', foreignKey: 'working_schedule_id' });
  };

  return WorkingSchedule;
};
