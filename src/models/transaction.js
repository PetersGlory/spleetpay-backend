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
    field: 'merchant_id',
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  paymentRequestId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'payment_request_id',
    references: {
      model: 'payment_requests',
      key: 'id'
    }
  },
  qrCodeId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'qr_code_id',  // Added field name
    references: {
      model: 'qr_codes',  // ✅ Changed to actual table name
      key: 'id'
    }
  },
  participantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'participant_id',
    references: {
      model: 'split_participants',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
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
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'customer_phone'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  merchantFee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'merchant_fee'
  },
  gatewayFee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'gateway_fee'
  },
  netAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'net_amount'
  },
  tipAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'tip_amount'
  },
  currency: {
    type: DataTypes.CHAR(3),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(100),
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
  paymentProvider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_provider'
  },
  providerTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'provider_transaction_id'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'partial', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  pspResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'psp_response'
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'gateway_response'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'transactions'
});

module.exports = Transaction;