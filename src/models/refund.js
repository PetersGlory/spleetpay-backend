const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Refund = sequelize.define('Refund', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'transactions',
      key: 'id'
    },
    field: 'payment_id'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'requested_by'
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'processed_by'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at'
  },
  gatewayReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'gateway_reference'
  }
}, {
  timestamps: true,
  tableName: 'refunds'
});

module.exports = Refund;
