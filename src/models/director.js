const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Director = sequelize.define('Director', {
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
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  bvn: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ownershipPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'ownership_percentage'
  }
}, {
  timestamps: true,
  tableName: 'directors'
});

module.exports = Director;
