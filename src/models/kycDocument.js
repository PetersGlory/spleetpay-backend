const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KYCDocument = sequelize.define('KYCDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'merchants',
      key: 'id'
    },
    field: 'merchant_id'
  },
  documentType: {
    type: DataTypes.ENUM('cac_certificate', 'proof_of_address', 'identity_document', 'director_id'),
    allowNull: false,
    field: 'document_type'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name'
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'uploaded_at'
  }
}, {
  timestamps: true,
  tableName: 'kyc_documents'
});

module.exports = KYCDocument;
