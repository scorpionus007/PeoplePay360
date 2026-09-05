'use strict';

const { DataTypes } = require('sequelize');
const { DEPENDENT_RELATION } = require('../../../config/constants');

module.exports = (sequelize) => {
  const BenefitDependent = sequelize.define(
    'BenefitDependent',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      benefit_enrollment_id: { type: DataTypes.UUID, allowNull: false },
      first_name: { type: DataTypes.STRING(100), allowNull: false },
      last_name: { type: DataTypes.STRING(100), allowNull: false },
      relation: {
        type: DataTypes.ENUM(...Object.values(DEPENDENT_RELATION)),
        allowNull: false,
      },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      gender: { type: DataTypes.STRING(20), allowNull: true },
      national_id: { type: DataTypes.STRING(80), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'benefit_dependents',
      indexes: [{ fields: ['benefit_enrollment_id'] }, { fields: ['relation'] }],
    }
  );

  BenefitDependent.associate = (models) => {
    BenefitDependent.belongsTo(models.BenefitEnrollment, {
      as: 'enrollment',
      foreignKey: 'benefit_enrollment_id',
    });
  };

  return BenefitDependent;
};
