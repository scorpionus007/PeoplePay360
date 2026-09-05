'use strict';

const { DataTypes } = require('sequelize');
const { EDR_EVENT_SEVERITY } = require('../../../config/constants');

module.exports = (sequelize) => {
  const EdrEvent = sequelize.define(
    'EdrEvent',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      edr_integration_id: { type: DataTypes.UUID, allowNull: false },
      device_id: { type: DataTypes.UUID, allowNull: true },
      external_event_id: { type: DataTypes.STRING(200), allowNull: true },
      event_type: { type: DataTypes.STRING(120), allowNull: false },
      severity: {
        type: DataTypes.ENUM(...Object.values(EDR_EVENT_SEVERITY)),
        allowNull: false,
        defaultValue: EDR_EVENT_SEVERITY.INFO,
      },
      occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      title: { type: DataTypes.STRING(300), allowNull: true },
      summary: { type: DataTypes.STRING(2000), allowNull: true },
      raw_payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      status: {
        type: DataTypes.ENUM('new', 'triaged', 'in_progress', 'resolved', 'false_positive'),
        allowNull: false,
        defaultValue: 'new',
      },
      assigned_to: { type: DataTypes.UUID, allowNull: true },
      resolved_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'it_edr_events',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['edr_integration_id'] },
        { fields: ['device_id'] },
        { fields: ['severity'] },
        { fields: ['status'] },
        { fields: ['occurred_at'] },
        { fields: ['edr_integration_id', 'external_event_id'], unique: true, where: { external_event_id: { [require('sequelize').Op.ne]: null } } },
      ],
    }
  );

  EdrEvent.associate = (models) => {
    EdrEvent.belongsTo(models.EdrIntegration, {
      as: 'integration',
      foreignKey: 'edr_integration_id',
    });
    EdrEvent.belongsTo(models.Device, { as: 'device', foreignKey: 'device_id' });
  };

  return EdrEvent;
};
