const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Merchant = sequelize.define('Merchant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'business_name'
  },
  businessEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'business_email'
  },
  businessPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'business_phone'
  },
  businessAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'business_address'
  },
  cacNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'cac_number'
  },
  businessType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'business_type'
  },
  websiteUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'website_url'
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'submitted', 'approved', 'rejected'),
    defaultValue: 'pending',
    field: 'kyc_status'
  },
  kycSubmittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'kyc_submitted_at'
  },
  kycApprovedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'kyc_approved_at'
  },
  apiKey: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'api_key'
  },
  webhookUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'webhook_url'
  },
  settlementAccountNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'settlement_account_number'
  },
  settlementBankCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'settlement_bank_code'
  },
  settlementAccountName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'settlement_account_name'
  },
  onboardingStatus: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'active'),
    defaultValue: 'draft',
    field: 'onboarding_status'
  },
  settlementSchedule: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
    defaultValue: 'daily',
    field: 'settlement_schedule'
  },
  fees: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'merchants'
});

module.exports = Merchant;
