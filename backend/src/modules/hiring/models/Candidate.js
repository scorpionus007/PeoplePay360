'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Candidate = sequelize.define(
    'Candidate',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      first_name: { type: DataTypes.STRING(100), allowNull: false },
      last_name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(200), allowNull: false },
      phone: { type: DataTypes.STRING(40), allowNull: true },
      current_title: { type: DataTypes.STRING(200), allowNull: true },
      current_company: { type: DataTypes.STRING(200), allowNull: true },
      location: { type: DataTypes.STRING(200), allowNull: true },
      country_code: { type: DataTypes.STRING(2), allowNull: true },
      linkedin_url: { type: DataTypes.STRING(500), allowNull: true },
      github_url: { type: DataTypes.STRING(500), allowNull: true },
      portfolio_url: { type: DataTypes.STRING(500), allowNull: true },
      resume_url: { type: DataTypes.STRING(1000), allowNull: true },
      years_of_experience: { type: DataTypes.DECIMAL(4, 1), allowNull: true },
      expected_salary_min: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      expected_salary_max: { type: DataTypes.DECIMAL(18, 4), allowNull: true },
      expected_currency: { type: DataTypes.STRING(3), allowNull: true },
      notice_period_days: { type: DataTypes.INTEGER, allowNull: true },
      tags: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      internal_notes: { type: DataTypes.STRING(2000), allowNull: true },
      background_check_status: {
        type: DataTypes.ENUM('not_requested', 'requested', 'in_progress', 'cleared', 'flagged'),
        allowNull: false,
        defaultValue: 'not_requested',
      },
      is_blacklisted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'hiring_candidates',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'email'], unique: true },
        { fields: ['is_blacklisted'] },
      ],
    }
  );

  Candidate.associate = (models) => {
    Candidate.hasMany(models.Application, { as: 'applications', foreignKey: 'candidate_id' });
    Candidate.hasMany(models.Referral, { as: 'referrals', foreignKey: 'candidate_id' });
  };

  return Candidate;
};
