const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentRate = sequelize.define('PaymentRate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title:{
        type:DataTypes.STRING,
        unique:true,
        allowNull: false
    },
    slug:{
        type: DataTypes.ENUM('processing_fee', 'service_fee'),
        allowNull:false        
    },
    ratePercent:{
        type:DataTypes.STRING,
        allowNull: false,
        field: 'rate_percent'
    }
}, {
    timestamps: true,
    tableName: 'payment_rates',
    indexes: [
      {
        fields: ['rate_percent']
      }
    ]
  });

module.exports = PaymentRate;