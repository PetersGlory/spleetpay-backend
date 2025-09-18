const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dispute = sequelize.define('Dispute', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'transactions',
      key: 'id'
    },
    field: 'transaction_id'
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
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'customer_id'
  },
  type: {
    type: DataTypes.ENUM('chargeback', 'refund_request', 'service_dispute', 'fraud'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'investigating', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'NGN'
  },
  evidence: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_to'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at'
  }
}, {
  timestamps: true,
  tableName: 'disputes'
});

module.exports = Dispute;
