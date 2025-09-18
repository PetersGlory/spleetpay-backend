const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SplitParticipant = sequelize.define('SplitParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'payment_request_id',
    references: {
      model: 'payment_requests',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  hasPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_paid'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'paid_amount'
  },
  paymentMethod: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'payment_method'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at'
  },
  participantLink: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'participant_link'
  },
  linkToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'link_token'
  }
}, {
  timestamps: true,
  tableName: 'split_participants',
  indexes: [
    {
      fields: ['payment_request_id']
    },
    {
      fields: ['participant_link']
    },
    {
      fields: ['link_token']
    },
    {
      fields: ['has_paid']
    }
  ]
});

module.exports = SplitParticipant;
