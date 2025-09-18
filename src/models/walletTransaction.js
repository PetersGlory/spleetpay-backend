const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
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
  transactionId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'transaction_id',
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'balance_after'
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'wallet_transactions',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['reference']
    }
  ]
});

module.exports = WalletTransaction;
