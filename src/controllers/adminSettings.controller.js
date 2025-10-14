const { AdminUser, AdminPermission, AdminSetting, AuditLog } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const emailService = require('../services/email.service');

// Permission constants
const PERMISSIONS = {
  users: "User Management",
  merchants: "Merchant Management", 
  payments: "Payment Monitoring",
  settlements: "Settlement Management",
  disputes: "Dispute Resolution",
  analytics: "Analytics Access",
  reports: "Report Generation",
  admin_management: "Admin Management",
  system_config: "System Configuration",
  audit_logs: "Audit Logs"
};

const ROLE_PERMISSIONS = {
  super_admin: Object.keys(PERMISSIONS),
  admin: ["users", "merchants", "payments", "settlements", "disputes", "analytics", "reports"],
  moderator: ["users", "disputes", "reports"],
  analyst: ["analytics", "reports"]
};

// Helper function to log admin actions
const logAdminAction = async (adminId, action, resourceType = null, resourceId = null, details = null, req = null) => {
  try {
    await AuditLog.create({
      adminId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent')
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Helper function to check permissions
const hasPermission = (adminRole, requiredPermission) => {
  const rolePermissions = ROLE_PERMISSIONS[adminRole] || [];
  return rolePermissions.includes(requiredPermission);
};

// Helper function to generate temporary password
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

module.exports = {
  // Get all administrators
  async getAdmins(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        status,
        search
      } = req.query;

      // Check permissions
      if (!hasPermission(req.adminUser.role, 'admin_management')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to view administrators'
          }
        });
      }

      const whereClause = {};

      if (role) whereClause.role = role;
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await AdminUser.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: AdminPermission,
            as: 'adminPermissions',
            attributes: ['permission']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['lastLogin', 'DESC']]
      });

      // Log the action
      await logAdminAction(req.adminUser.id, 'VIEW_ADMINS', 'admin', null, { filters: { role, status, search } }, req);

      res.json({
        success: true,
        data: {
          admins: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get admins error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch administrators'
        }
      });
    }
  },

  // Get single administrator
  async getAdmin(req, res) {
    try {
      const { id } = req.params;

      // Check permissions
      if (!hasPermission(req.adminUser.role, 'admin_management')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to view administrator details'
          }
        });
      }

      const admin = await AdminUser.findByPk(id, {
        include: [
          {
            model: AdminPermission,
            as: 'adminPermissions',
            attributes: ['permission']
          }
        ]
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Administrator not found'
          }
        });
      }

      // Log the action
      await logAdminAction(req.adminUser.id, 'VIEW_ADMIN', 'admin', id, null, req);

      res.json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Get admin error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch administrator'
        }
      });
    }
  },

  // Create administrator
  async createAdmin(req, res) {
    try {
      const { name, email, role, department, permissions } = req.body;

      // Check permissions - only super admins can create admins
      if (req.adminUser.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only super admins can create administrators'
          }
        });
      }

      // Validate email uniqueness
      const existingAdmin = await AdminUser.findOne({ where: { email } });
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'Email already exists'
          }
        });
      }

      // Generate temporary password
      const temporaryPassword = generateTemporaryPassword();

      // Create admin user
      const admin = await AdminUser.create({
        name,
        email,
        role,
        department,
        passwordHash: temporaryPassword,
        permissions: permissions || ROLE_PERMISSIONS[role] || []
      });

      // Create permissions
      const adminPermissions = permissions || ROLE_PERMISSIONS[role] || [];
      const permissionPromises = adminPermissions.map(permission =>
        AdminPermission.create({
          adminId: admin.id,
          permission
        })
      );
      await Promise.all(permissionPromises);

      // Send welcome email
      try {
        await emailService.sendAdminWelcomeEmail({
          email: admin.email,
          name: admin.name,
          temporaryPassword,
          role: admin.role
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      // Log the action
      await logAdminAction(req.adminUser.id, 'CREATE_ADMIN', 'admin', admin.id, { 
        adminName: admin.name, 
        adminEmail: admin.email, 
        role: admin.role 
      }, req);

      res.status(201).json({
        success: true,
        data: admin,
        message: 'Administrator created successfully'
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create administrator'
        }
      });
    }
  },

  // Update administrator
  async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, department, permissions, status } = req.body;

      // Check permissions - only super admins can update admins
      if (req.adminUser.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only super admins can update administrators'
          }
        });
      }

      // Prevent users from modifying their own account
      if (id === req.adminUser.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_MODIFY_SELF',
            message: 'Cannot modify your own account'
          }
        });
      }

      const admin = await AdminUser.findByPk(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Administrator not found'
          }
        });
      }

      // Validate email uniqueness if email is being changed
      if (email && email !== admin.email) {
        const existingAdmin = await AdminUser.findOne({ where: { email } });
        if (existingAdmin) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_EMAIL',
              message: 'Email already exists'
            }
          });
        }
      }

      // Update admin
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (department !== undefined) updateData.department = department;
      if (status !== undefined) updateData.status = status;

      await admin.update(updateData);

      // Update permissions if provided
      if (permissions) {
        // Remove existing permissions
        await AdminPermission.destroy({ where: { adminId: id } });
        
        // Add new permissions
        const permissionPromises = permissions.map(permission =>
          AdminPermission.create({
            adminId: id,
            permission
          })
        );
        await Promise.all(permissionPromises);
      }

      // Log the action
      await logAdminAction(req.adminUser.id, 'UPDATE_ADMIN', 'admin', id, { 
        changes: updateData,
        permissions: permissions 
      }, req);

      res.json({
        success: true,
        data: admin,
        message: 'Administrator updated successfully'
      });
    } catch (error) {
      console.error('Update admin error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update administrator'
        }
      });
    }
  },

  // Delete administrator
  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;

      // Check permissions - only super admins can delete admins
      if (req.adminUser.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only super admins can delete administrators'
          }
        });
      }

      // Prevent users from deleting their own account
      if (id === req.adminUser.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'Cannot delete your own account'
          }
        });
      }

      const admin = await AdminUser.findByPk(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Administrator not found'
          }
        });
      }

      // Check if this is the last super admin
      if (admin.role === 'super_admin') {
        const superAdminCount = await AdminUser.count({ 
          where: { 
            role: 'super_admin',
            status: 'active',
            id: { [Op.ne]: id }
          } 
        });
        
        if (superAdminCount === 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'LAST_SUPER_ADMIN',
              message: 'Cannot delete the last super admin'
            }
          });
        }
      }

      // Soft delete
      await admin.update({ status: 'inactive' });

      // Log the action
      await logAdminAction(req.adminUser.id, 'DELETE_ADMIN', 'admin', id, { 
        adminName: admin.name, 
        adminEmail: admin.email 
      }, req);

      res.json({
        success: true,
        message: 'Administrator deleted successfully'
      });
    } catch (error) {
      console.error('Delete admin error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete administrator'
        }
      });
    }
  },

  // Toggle admin status
  async toggleAdminStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Check permissions
      if (!hasPermission(req.adminUser.role, 'admin_management')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to toggle admin status'
          }
        });
      }

      // Prevent users from deactivating their own account
      if (id === req.adminUser.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_MODIFY_SELF',
            message: 'Cannot modify your own account status'
          }
        });
      }

      const admin = await AdminUser.findByPk(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Administrator not found'
          }
        });
      }

      await admin.update({ status });

      // Log the action
      await logAdminAction(req.adminUser.id, 'TOGGLE_ADMIN_STATUS', 'admin', id, { 
        newStatus: status,
        adminName: admin.name 
      }, req);

      res.json({
        success: true,
        data: {
          id: admin.id,
          status: admin.status,
          updatedAt: admin.updatedAt
        },
        message: `Administrator ${status === 'active' ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Toggle admin status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle admin status'
        }
      });
    }
  },

  // Reset admin password
  async resetAdminPassword(req, res) {
    try {
      const { id } = req.params;

      // Check permissions
      if (!hasPermission(req.adminUser.role, 'admin_management')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to reset admin password'
          }
        });
      }

      const admin = await AdminUser.findByPk(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Administrator not found'
          }
        });
      }

      // Generate new temporary password
      const temporaryPassword = generateTemporaryPassword();
      await admin.update({ passwordHash: temporaryPassword });

      // Send password reset email
      try {
        await emailService.sendAdminPasswordResetEmail({
          email: admin.email,
          name: admin.name,
          temporaryPassword
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }

      // Log the action
      await logAdminAction(req.adminUser.id, 'RESET_ADMIN_PASSWORD', 'admin', id, { 
        adminName: admin.name 
      }, req);

      res.json({
        success: true,
        data: {
          id: admin.id,
          temporaryPassword,
          resetAt: new Date().toISOString()
        },
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset admin password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset admin password'
        }
      });
    }
  },

  // Get system settings
  async getSystemSettings(req, res) {
    try {
      // Check permissions
      if (!hasPermission(req.adminUser.role, 'system_config')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to view system settings'
          }
        });
      }

      // Get all settings from database
      const settings = await AdminSetting.findAll();
      
      // Convert to object format
      const settingsObject = {};
      settings.forEach(setting => {
        let value = setting.settingValue;
        
        // Parse JSON values
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value) && value !== '') value = Number(value);
        else if (value.startsWith('{') || value.startsWith('[')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        settingsObject[setting.settingKey] = value;
      });

      // Set defaults if settings don't exist
      const defaultSettings = {
        twoFactorRequired: process.env.ADMIN_2FA_REQUIRED === 'true' || false,
        sessionTimeout: parseInt(process.env.ADMIN_SESSION_TIMEOUT) || 8,
        passwordExpiry: parseInt(process.env.ADMIN_PASSWORD_EXPIRY) || 90,
        loginAttempts: parseInt(process.env.ADMIN_MAX_LOGIN_ATTEMPTS) || 5,
        auditLogging: process.env.ADMIN_AUDIT_LOGGING === 'true' || true,
        emailNotifications: process.env.ADMIN_EMAIL_NOTIFICATIONS === 'true' || true,
        systemMaintenance: false,
        maintenanceMessage: '',
        apiRateLimit: parseInt(process.env.ADMIN_API_RATE_LIMIT) || 1000,
        webhookRetryAttempts: parseInt(process.env.ADMIN_WEBHOOK_RETRY_ATTEMPTS) || 3
      };

      const finalSettings = { ...defaultSettings, ...settingsObject };

      res.json({
        success: true,
        data: finalSettings
      });
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch system settings'
        }
      });
    }
  },

  // Update system settings
  async updateSystemSettings(req, res) {
    try {
      // Check permissions - only super admins can update settings
      if (req.adminUser.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only super admins can update system settings'
          }
        });
      }

      const settings = req.body;

      // Validate settings
      const validations = {
        sessionTimeout: (val) => val >= 1 && val <= 24,
        passwordExpiry: (val) => val >= 30 && val <= 365,
        loginAttempts: (val) => val >= 3 && val <= 10,
        apiRateLimit: (val) => val >= 100 && val <= 10000,
        webhookRetryAttempts: (val) => val >= 1 && val <= 5
      };

      for (const [key, validator] of Object.entries(validations)) {
        if (settings[key] !== undefined && !validator(settings[key])) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Invalid value for ${key}`
            }
          });
        }
      }

      // Update settings in database
      const updatePromises = Object.entries(settings).map(async ([key, value]) => {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        await AdminSetting.upsert({
          settingKey: key,
          settingValue: stringValue,
          updatedBy: req.adminUser.id
        });
      });

      await Promise.all(updatePromises);

      // Log the action
      await logAdminAction(req.adminUser.id, 'UPDATE_SYSTEM_SETTINGS', 'settings', null, { 
        settings 
      }, req);

      res.json({
        success: true,
        data: settings,
        message: 'System settings updated successfully'
      });
    } catch (error) {
      console.error('Update system settings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update system settings'
        }
      });
    }
  },

  // Get audit logs
  async getAuditLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        adminId,
        action,
        resourceType,
        startDate,
        endDate
      } = req.query;

      // Check permissions
      if (!hasPermission(req.adminUser.role, 'audit_logs')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to view audit logs'
          }
        });
      }

      const whereClause = {};

      if (adminId) whereClause.adminId = adminId;
      if (action) whereClause.action = { [Op.iLike]: `%${action}%` };
      if (resourceType) whereClause.resourceType = resourceType;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: AdminUser,
            as: 'admin',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          auditLogs: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs'
        }
      });
    }
  }
};
