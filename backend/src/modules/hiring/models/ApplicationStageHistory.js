'use strict';

const { DataTypes } = require('sequelize');
const { APPLICATION_STAGE } = require('../../../config/constants');

module.exports = (sequelize) => {
  const ApplicationStageHistory = sequelize.define(
    'ApplicationStageHistory',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      application_id: { type: DataTypes.UUID, allowNull: false },
      from_stage: {
        type: DataTypes.ENUM(...Object.values(APPLICATION_STAGE)),
        allowNull: true,
      },
      to_stage: {
        type: DataTypes.ENUM(...Object.values(APPLICATION_STAGE)),
        allowNull: false,
      },
      changed_by: { type: DataTypes.UUID, allowNull: true },
      note: { type: DataTypes.STRING(1000), allowNull: true },
      changed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'hiring_application_stage_history',
      updatedAt: false,
      indexes: [{ fields: ['application_id'] }, { fields: ['to_stage'] }],
    }
  );

  ApplicationStageHistory.associate = (models) => {
    ApplicationStageHistory.belongsTo(models.Application, {
      as: 'application',
      foreignKey: 'application_id',
    });
  };

  return ApplicationStageHistory;
};
