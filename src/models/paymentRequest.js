const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentRequest = sequelize.define('PaymentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  type: {
    type: DataTypes.ENUM('pay_for_me', 'group_split'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.CHAR(3),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'partially_paid', 'completed', 'expired'),
    defaultValue: 'pending'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  paymentLink: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'payment_link'
  },
  qrCodeUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'qr_code_url'
  },
  allowTips: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'allow_tips'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'total_amount'
  },
  splitType: {
    type: DataTypes.ENUM('equal', 'unequal'),
    allowNull: true,
    field: 'split_type'
  },
  linkToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'link_token'
  }
}, {
  timestamps: true,
  tableName: 'payment_requests',
  indexes: [
    {
      fields: ['payment_link']
    },
    {
      fields: ['link_token']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = PaymentRequest;
