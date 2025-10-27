const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settlement = sequelize.define('Settlement', {
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
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  netAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'net_amount'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  settlementDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'settlement_date'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    field: 'reference'
  },
  bankReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'bank_reference'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bankAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'bank_account_id'
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'failure_reason'
  },
  transactionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'transaction_count'
  },
  settlementType: {
    type: DataTypes.ENUM('T+0', 'T+1', 'manual'),
    defaultValue: 'T+1',
    field: 'settlement_type'
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'period_start'
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'period_end'
  },
  bankAccount: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'bank_account'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at'
  }
}, {
  timestamps: true,
  tableName: 'settlements'
});

module.exports = Settlement;
