const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'merchants',
      key: 'id'
    },
    field: 'merchant_id'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('pay_for_me', 'group_split'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'NGN'
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_name'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_email'
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'customer_phone'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  },
  paymentGateway: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_gateway'
  },
  gatewayReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'gateway_reference'
  },
  merchantFee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'merchant_fee'
  },
  gatewayFee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'gateway_fee'
  },
  netAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'net_amount'
  },
  settlementStatus: {
    type: DataTypes.ENUM('pending', 'settled', 'failed'),
    defaultValue: 'pending',
    field: 'settlement_status'
  },
  settledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'settled_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  pspResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'psp_response'
  },
  fraudScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'fraud_score'
  },
  fraudFlags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    field: 'fraud_flags'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'transactions'
});

module.exports = Transaction;
