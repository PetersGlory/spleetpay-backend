const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupSplitContributor = sequelize.define('GroupSplitContributor', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'payment_reference'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  }
}, {
  timestamps: true,
  tableName: 'group_split_contributors'
});

module.exports = GroupSplitContributor;
