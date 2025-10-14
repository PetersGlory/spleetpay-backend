const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'admin_users',
      key: 'id'
    },
    field: 'admin_id'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'resource_type'
  },
  resourceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'resource_id'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 max length is 45 characters
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  timestamps: true,
  tableName: 'audit_logs',
  indexes: [
    {
      fields: ['admin_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['resource_type', 'resource_id']
    }
  ]
});

module.exports = AuditLog;
