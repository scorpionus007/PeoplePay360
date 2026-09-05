'use strict';

const { DataTypes } = require('sequelize');
const { VISA_TYPE, VISA_STATUS } = require('../../../config/constants');

module.exports = (sequelize) => {
  const VisaSponsorship = sequelize.define(
    'VisaSponsorship',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      employee_id: { type: DataTypes.UUID, allowNull: false },
      mobility_partner_id: { type: DataTypes.UUID, allowNull: true },
      case_code: { type: DataTypes.STRING(80), allowNull: false },
      visa_type: {
        type: DataTypes.ENUM(...Object.values(VISA_TYPE)),
        allowNull: false,
        defaultValue: VISA_TYPE.WORK_VISA,
      },
      country_code: { type: DataTypes.STRING(2), allowNull: false },
      visa_category: { type: DataTypes.STRING(80), allowNull: true },
      status: {
        type: DataTypes.ENUM(...Object.values(VISA_STATUS)),
        allowNull: false,
        defaultValue: VISA_STATUS.INITIATED,
      },
      requested_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      filed_at: { type: DataTypes.DATE, allowNull: true },
      decision_at: { type: DataTypes.DATE, allowNull: true },
      valid_from: { type: DataTypes.DATEONLY, allowNull: true },
      valid_to: { type: DataTypes.DATEONLY, allowNull: true },
      renewal_of_case_id: { type: DataTypes.UUID, allowNull: true },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
      },
      total_cost_amount: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      approved_by: { type: DataTypes.UUID, allowNull: true },
      approved_at: { type: DataTypes.DATE, allowNull: true },
      approval_note: { type: DataTypes.STRING(1000), allowNull: true },
      denial_reason: { type: DataTypes.STRING(1000), allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'mobility_visa_sponsorships',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['employee_id'] },
        { fields: ['status'] },
        { fields: ['country_code'] },
        { fields: ['organization_id', 'case_code'], unique: true },
      ],
    }
  );

  VisaSponsorship.associate = (models) => {
    VisaSponsorship.belongsTo(models.Employee, { as: 'employee', foreignKey: 'employee_id' });
    VisaSponsorship.belongsTo(models.MobilityPartner, {
      as: 'partner',
      foreignKey: 'mobility_partner_id',
    });
    VisaSponsorship.hasMany(models.VisaDocument, {
      as: 'documents',
      foreignKey: 'visa_sponsorship_id',
    });
    VisaSponsorship.belongsTo(models.VisaSponsorship, {
      as: 'previous_case',
      foreignKey: 'renewal_of_case_id',
    });
  };

  return VisaSponsorship;
};
