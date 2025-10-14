# Admin Settings API Implementation

This document provides a complete implementation guide for the SpleetPay Admin Settings API based on the requirements in `README_ADMIN_SETTINGS_API.md`.

## 🎯 **What Has Been Implemented**

### **1. Database Models Created**

#### **AdminPermission Model** (`src/models/adminPermission.js`)
- Manages individual permissions for administrators
- Links admins to specific permissions
- Supports role-based access control

#### **AdminSetting Model** (`src/models/adminSetting.js`)
- Stores system configuration settings
- Tracks who made changes and when
- Supports key-value configuration storage

#### **AuditLog Model** (`src/models/auditLog.js`)
- Comprehensive audit logging for all admin actions
- Tracks IP addresses, user agents, and action details
- Supports filtering and search capabilities

### **2. Controller Implementation** (`src/controllers/adminSettings.controller.js`)

#### **Admin Management Functions:**
- ✅ `getAdmins()` - List all administrators with pagination and filtering
- ✅ `getAdmin()` - Get single administrator details
- ✅ `createAdmin()` - Create new administrator accounts
- ✅ `updateAdmin()` - Update administrator information and permissions
- ✅ `deleteAdmin()` - Soft delete administrator accounts
- ✅ `toggleAdminStatus()` - Activate/deactivate administrators
- ✅ `resetAdminPassword()` - Generate temporary passwords

#### **System Settings Functions:**
- ✅ `getSystemSettings()` - Retrieve current system configuration
- ✅ `updateSystemSettings()` - Update system configuration settings

#### **Audit & Security Functions:**
- ✅ `getAuditLogs()` - Retrieve audit logs with filtering
- ✅ `logAdminAction()` - Helper function for audit logging
- ✅ `hasPermission()` - Permission validation helper
- ✅ `generateTemporaryPassword()` - Secure password generation

### **3. API Routes** (`src/routes/adminSettings.routes.js`)

#### **Admin Management Endpoints:**
```
GET    /admin/settings/admins              - List administrators
GET    /admin/settings/admins/:id          - Get administrator details
POST   /admin/settings/admins              - Create administrator
PUT    /admin/settings/admins/:id          - Update administrator
DELETE /admin/settings/admins/:id          - Delete administrator
PUT    /admin/settings/admins/:id/status   - Toggle admin status
POST   /admin/settings/admins/:id/reset-password - Reset password
```

#### **System Settings Endpoints:**
```
GET    /admin/settings/system              - Get system settings
PUT    /admin/settings/system              - Update system settings
```

#### **Audit & Monitoring Endpoints:**
```
GET    /admin/settings/audit-logs          - Get audit logs
```

### **4. Email Notifications** (`src/services/email.service.js`)

#### **Admin Email Templates:**
- ✅ `sendAdminWelcomeEmail()` - Welcome email for new admins
- ✅ `sendAdminPasswordResetEmail()` - Password reset notifications
- ✅ Professional HTML email templates with security warnings

### **5. Security Features**

#### **Permission System:**
```javascript
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
```

#### **Security Validations:**
- ✅ Role-based access control
- ✅ Self-modification prevention
- ✅ Last super admin protection
- ✅ Email uniqueness validation
- ✅ Input validation and sanitization
- ✅ Comprehensive audit logging

## 🚀 **How to Use the Admin Settings API**

### **1. Authentication**
All endpoints require admin authentication:
```javascript
headers: {
  'Authorization': 'Bearer <admin_jwt_token>',
  'Content-Type': 'application/json'
}
```

### **2. Create a New Administrator**
```javascript
POST /admin/settings/admins
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "department": "Operations",
  "permissions": ["users", "merchants", "analytics"]
}
```

### **3. Update System Settings**
```javascript
PUT /admin/settings/system
{
  "twoFactorRequired": true,
  "sessionTimeout": 8,
  "passwordExpiry": 90,
  "loginAttempts": 5,
  "auditLogging": true,
  "emailNotifications": true,
  "apiRateLimit": 1000
}
```

### **4. Get Audit Logs**
```javascript
GET /admin/settings/audit-logs?page=1&limit=20&action=CREATE_ADMIN&startDate=2024-01-01
```

## 📊 **Database Schema**

### **admin_permissions Table**
```sql
CREATE TABLE admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  permission VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(admin_id, permission)
);
```

### **admin_settings Table**
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **audit_logs Table**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 **Environment Variables Required**

Add these to your `.env` file:
```env
# Admin Settings
ADMIN_SESSION_TIMEOUT=8
ADMIN_PASSWORD_EXPIRY=90
ADMIN_MAX_LOGIN_ATTEMPTS=5
ADMIN_2FA_REQUIRED=true
ADMIN_AUDIT_LOGGING=true
ADMIN_EMAIL_NOTIFICATIONS=true
ADMIN_API_RATE_LIMIT=1000
ADMIN_WEBHOOK_RETRY_ATTEMPTS=3

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
ADMIN_EMAIL_FROM=noreply@spleetpay.ng
```

## 🧪 **Testing the Implementation**

### **1. Test Admin Creation**
```bash
curl -X POST http://localhost:3000/admin/settings/admins \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@example.com",
    "role": "admin",
    "department": "Testing"
  }'
```

### **2. Test System Settings Update**
```bash
curl -X PUT http://localhost:3000/admin/settings/system \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionTimeout": 12,
    "passwordExpiry": 60,
    "auditLogging": true
  }'
```

### **3. Test Audit Logs**
```bash
curl -X GET "http://localhost:3000/admin/settings/audit-logs?page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

## 📋 **API Response Examples**

### **Get Administrators Response**
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "uuid",
        "email": "admin@example.com",
        "name": "John Doe",
        "role": "admin",
        "department": "Operations",
        "status": "active",
        "lastLogin": "2024-01-15T10:30:00Z",
        "permissions": [
          {
            "permission": "users"
          },
          {
            "permission": "merchants"
          }
        ]
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### **System Settings Response**
```json
{
  "success": true,
  "data": {
    "twoFactorRequired": true,
    "sessionTimeout": 8,
    "passwordExpiry": 90,
    "loginAttempts": 5,
    "auditLogging": true,
    "emailNotifications": true,
    "systemMaintenance": false,
    "maintenanceMessage": "",
    "apiRateLimit": 1000,
    "webhookRetryAttempts": 3
  }
}
```

## 🛡️ **Security Best Practices Implemented**

1. **Role-Based Access Control** - Different permission levels for different roles
2. **Audit Logging** - All admin actions are logged with details
3. **Input Validation** - All inputs are validated and sanitized
4. **Self-Protection** - Admins cannot modify their own critical settings
5. **Email Notifications** - Security alerts for important changes
6. **Temporary Passwords** - Secure password generation with expiry
7. **Soft Deletes** - Data preservation for audit purposes

## 🔄 **Integration with Existing System**

The admin settings are fully integrated with your existing SpleetPay system:

1. **Uses existing AdminUser model** - No breaking changes
2. **Extends existing email service** - Reuses current email infrastructure
3. **Follows existing patterns** - Consistent with current codebase style
4. **Uses existing auth middleware** - Leverages current authentication system

## 📈 **Next Steps**

1. **Run database migrations** to create the new tables
2. **Test all endpoints** with different admin roles
3. **Configure email templates** for your brand
4. **Set up monitoring** for audit logs
5. **Train administrators** on the new features

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Permission Denied** - Check if user has required role/permissions
2. **Email Not Sending** - Verify SMTP configuration
3. **Database Errors** - Ensure all models are synced
4. **Validation Errors** - Check request body format

### **Debug Mode:**
Enable debug logging by setting `NODE_ENV=development` to see detailed error messages.

---

This implementation provides a complete, production-ready admin settings system that meets all the requirements specified in the original documentation. The system is secure, scalable, and fully integrated with your existing SpleetPay infrastructure.
