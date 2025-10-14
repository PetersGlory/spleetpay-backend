const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminPermission = sequelize.define('AdminPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'admin_users',
      key: 'id'
    },
    field: 'admin_id'
  },
  permission: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'admin_permissions',
  indexes: [
    {
      unique: true,
      fields: ['admin_id', 'permission']
    }
  ]
});

module.exports = AdminPermission;
