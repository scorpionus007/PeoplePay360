'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkingScheduleDay = sequelize.define(
    'WorkingScheduleDay',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      working_schedule_id: { type: DataTypes.UUID, allowNull: false },
      day_of_week: {
        type: DataTypes.ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
        allowNull: false,
      },
      // Half day support: a day can have two blocks (e.g. morning and afternoon).
      block_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      start_time: { type: DataTypes.STRING(5), allowNull: false },
      end_time: { type: DataTypes.STRING(5), allowNull: false },
      break_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_working: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'working_schedule_days',
      indexes: [
        { fields: ['working_schedule_id'] },
        { fields: ['working_schedule_id', 'day_of_week', 'block_index'], unique: true },
      ],
    }
  );

  WorkingScheduleDay.associate = (models) => {
    WorkingScheduleDay.belongsTo(models.WorkingSchedule, {
      as: 'schedule',
      foreignKey: 'working_schedule_id',
    });
  };

  return WorkingScheduleDay;
};
