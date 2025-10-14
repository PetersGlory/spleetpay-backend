const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminSetting = sequelize.define('AdminSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  settingKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'setting_key'
  },
  settingValue: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'setting_value'
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'admin_users',
      key: 'id'
    },
    field: 'updated_by'
  }
}, {
  timestamps: true,
  tableName: 'admin_settings'
});

module.exports = AdminSetting;
