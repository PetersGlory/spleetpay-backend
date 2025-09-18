const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'moderator', 'analyst'),
    allowNull: false
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  }
}, {
  hooks: {
    beforeCreate: async (adminUser) => {
      if (adminUser.passwordHash) {
        const salt = await bcrypt.genSalt(12);
        adminUser.passwordHash = await bcrypt.hash(adminUser.passwordHash, salt);
      }
    },
    beforeUpdate: async (adminUser) => {
      if (adminUser.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(12);
        adminUser.passwordHash = await bcrypt.hash(adminUser.passwordHash, salt);
      }
    }
  },
  timestamps: true,
  tableName: 'admin_users'
});

// Instance method to check password
AdminUser.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = AdminUser;
