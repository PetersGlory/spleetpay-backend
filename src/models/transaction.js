const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
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
  participantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'participant_id',
    references: {
      model: 'split_participants',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
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
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'gateway_response'
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
