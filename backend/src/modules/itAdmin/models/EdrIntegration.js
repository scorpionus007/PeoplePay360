'use strict';

const { DataTypes } = require('sequelize');
const { EDR_VENDOR } = require('../../../config/constants');

module.exports = (sequelize) => {
  const EdrIntegration = sequelize.define(
    'EdrIntegration',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      vendor: {
        type: DataTypes.ENUM(...Object.values(EDR_VENDOR)),
        allowNull: false,
      },
      display_name: { type: DataTypes.STRING(200), allowNull: false },
      api_base_url: { type: DataTypes.STRING(500), allowNull: true },
      credentials_ref: { type: DataTypes.STRING(255), allowNull: true },
      status: {
        type: DataTypes.ENUM('connected', 'degraded', 'disconnected', 'error'),
        allowNull: false,
        defaultValue: 'disconnected',
      },
      last_synced_at: { type: DataTypes.DATE, allowNull: true },
      last_error: { type: DataTypes.STRING(1000), allowNull: true },
      settings: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'it_edr_integrations',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'vendor'] },
      ],
    }
  );

  EdrIntegration.associate = (models) => {
    EdrIntegration.hasMany(models.EdrEvent, { as: 'events', foreignKey: 'edr_integration_id' });
  };

  return EdrIntegration;
};
