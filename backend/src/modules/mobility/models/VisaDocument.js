'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VisaDocument = sequelize.define(
    'VisaDocument',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      visa_sponsorship_id: { type: DataTypes.UUID, allowNull: false },
      document_type: { type: DataTypes.STRING(120), allowNull: false },
      title: { type: DataTypes.STRING(200), allowNull: false },
      file_url: { type: DataTypes.STRING(1000), allowNull: true },
      uploaded_by: { type: DataTypes.UUID, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'uploaded', 'verified', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      expires_at: { type: DataTypes.DATEONLY, allowNull: true },
      note: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {
      tableName: 'mobility_visa_documents',
      indexes: [
        { fields: ['visa_sponsorship_id'] },
        { fields: ['document_type'] },
        { fields: ['status'] },
      ],
    }
  );

  VisaDocument.associate = (models) => {
    VisaDocument.belongsTo(models.VisaSponsorship, {
      as: 'sponsorship',
      foreignKey: 'visa_sponsorship_id',
    });
  };

  return VisaDocument;
};
