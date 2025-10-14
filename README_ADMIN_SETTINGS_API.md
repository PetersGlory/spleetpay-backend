# Admin Settings API Documentation

This document outlines the backend API endpoints and functionality required to support the Admin Settings section of the SpleetPay Admin Dashboard.

## Overview

The Admin Settings section provides comprehensive administrator management capabilities including user management, role-based permissions, and system configuration. This document details all required API endpoints, request/response formats, and business logic.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Admin Management Endpoints](#admin-management-endpoints)
3. [System Settings Endpoints](#system-settings-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Business Logic Requirements](#business-logic-requirements)

---

## Authentication & Authorization

All admin settings endpoints require proper authentication and authorization.

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

### Permission Levels
- **Super Admin**: Full access to all admin management features
- **Admin**: Can manage users and view settings (limited admin management)
- **Moderator**: Limited user management capabilities
- **Analyst**: Read-only access to analytics and reports

---

## Admin Management Endpoints

### 1. Get Administrators List

**Endpoint:** `GET /api/admin/admins`

**Description:** Retrieve a paginated list of administrators with optional filtering and search.

**Query Parameters:**
```typescript
{
  page?: number;        // Page number (default: 1)
  limit?: number;       // Items per page (default: 20)
  role?: string;        // Filter by role: 'super_admin', 'admin', 'moderator', 'analyst'
  status?: string;      // Filter by status: 'active', 'inactive'
  search?: string;      // Search by name or email
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    admins: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}
```

**Business Logic:**
- Only super admins and admins can access this endpoint
- Search should work on both name and email fields (case-insensitive)
- Results should be ordered by last login (most recent first)
- Include permission validation for each admin

### 2. Get Single Administrator

**Endpoint:** `GET /api/admin/admins/:id`

**Description:** Retrieve detailed information about a specific administrator.

**Response:**
```typescript
{
  success: boolean;
  data: AdminUser;
  message?: string;
}
```

**Business Logic:**
- Validate that the requesting user has permission to view admin details
- Include full permission list for the admin
- Return 404 if admin doesn't exist

### 3. Create Administrator

**Endpoint:** `POST /api/admin/admins`

**Description:** Create a new administrator account.

**Request Body:**
```typescript
{
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst';
  department: string;
  permissions?: string[];  // Optional, will use role defaults if not provided
}
```

**Response:**
```typescript
{
  success: boolean;
  data: AdminUser;
  message?: string;
}
```

**Business Logic:**
- Only super admins can create other administrators
- Validate email uniqueness
- Generate temporary password and send via email
- Set permissions based on role if not explicitly provided
- Log the creation action for audit purposes
- Send welcome email with temporary credentials

### 4. Update Administrator

**Endpoint:** `PUT /api/admin/admins/:id`

**Description:** Update administrator information and permissions.

**Request Body:**
```typescript
{
  name?: string;
  email?: string;
  role?: 'super_admin' | 'admin' | 'moderator' | 'analyst';
  department?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: AdminUser;
  message?: string;
}
```

**Business Logic:**
- Only super admins can update other administrators
- Prevent users from modifying their own role or status
- Validate email uniqueness if email is being changed
- Update permissions based on new role if role is changed
- Log all changes for audit purposes
- Send notification email if critical changes are made

### 5. Delete Administrator

**Endpoint:** `DELETE /api/admin/admins/:id`

**Description:** Permanently delete an administrator account.

**Response:**
```typescript
{
  success: boolean;
  message?: string;
}
```

**Business Logic:**
- Only super admins can delete administrators
- Prevent deletion of the last super admin
- Prevent users from deleting their own account
- Soft delete (mark as deleted) rather than hard delete
- Log deletion action for audit purposes
- Revoke all active sessions for the deleted admin

### 6. Toggle Admin Status

**Endpoint:** `PUT /api/admin/admins/:id/status`

**Description:** Activate or deactivate an administrator account.

**Request Body:**
```typescript
{
  status: 'active' | 'inactive';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    status: 'active' | 'inactive';
    updatedAt: string;
  };
  message?: string;
}
```

**Business Logic:**
- Only super admins and admins can toggle status
- Prevent users from deactivating their own account
- Revoke active sessions when deactivating
- Send notification email about status change
- Log status change for audit purposes

### 7. Reset Admin Password

**Endpoint:** `POST /api/admin/admins/:id/reset-password`

**Description:** Generate a new temporary password for an administrator.

**Response:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    temporaryPassword: string;
    resetAt: string;
  };
  message?: string;
}
```

**Business Logic:**
- Only super admins and admins can reset passwords
- Generate secure temporary password (8-12 characters)
- Set password expiry to 24 hours
- Send temporary password via email
- Log password reset action for audit purposes
- Force password change on next login

---

## System Settings Endpoints

### 1. Get System Settings

**Endpoint:** `GET /api/admin/settings`

**Description:** Retrieve current system configuration settings.

**Response:**
```typescript
{
  success: boolean;
  data: {
    twoFactorRequired: boolean;
    sessionTimeout: number;        // Hours
    passwordExpiry: number;        // Days
    loginAttempts: number;         // Max attempts before lockout
    auditLogging: boolean;
    emailNotifications: boolean;
    systemMaintenance: boolean;
    maintenanceMessage?: string;
    apiRateLimit: number;          // Requests per minute
    webhookRetryAttempts: number;
  };
  message?: string;
}
```

**Business Logic:**
- Only super admins and admins can view settings
- Return current configuration from database
- Include any environment-specific overrides

### 2. Update System Settings

**Endpoint:** `PUT /api/admin/settings`

**Description:** Update system configuration settings.

**Request Body:**
```typescript
{
  twoFactorRequired?: boolean;
  sessionTimeout?: number;
  passwordExpiry?: number;
  loginAttempts?: number;
  auditLogging?: boolean;
  emailNotifications?: boolean;
  systemMaintenance?: boolean;
  maintenanceMessage?: string;
  apiRateLimit?: number;
  webhookRetryAttempts?: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: AdminSettings;
  message?: string;
}
```

**Business Logic:**
- Only super admins can update system settings
- Validate all input values (e.g., sessionTimeout between 1-24 hours)
- Apply settings immediately where possible
- Log all setting changes for audit purposes
- Send notification to all admins about critical setting changes
- Update environment variables if needed

---

## Data Models

### AdminUser
```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst';
  permissions: string[];
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;        // ISO 8601 format
  createdAt: string;        // ISO 8601 format
  updatedAt: string;        // ISO 8601 format
}
```

### AdminSettings
```typescript
interface AdminSettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;        // Hours (1-24)
  passwordExpiry: number;        // Days (30-365)
  loginAttempts: number;         // Max attempts (3-10)
  auditLogging: boolean;
  emailNotifications: boolean;
  systemMaintenance: boolean;
  maintenanceMessage?: string;
  apiRateLimit: number;          // Requests per minute (100-10000)
  webhookRetryAttempts: number;  // Retry attempts (1-5)
}
```

### PaginationData
```typescript
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Error Handling

### Standard Error Response
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication token
- `FORBIDDEN` - Insufficient permissions for the action
- `NOT_FOUND` - Administrator or resource not found
- `VALIDATION_ERROR` - Invalid request data
- `DUPLICATE_EMAIL` - Email already exists
- `INVALID_ROLE` - Invalid role specified
- `CANNOT_DELETE_SELF` - Cannot delete own account
- `CANNOT_MODIFY_SELF` - Cannot modify own role/status
- `LAST_SUPER_ADMIN` - Cannot delete last super admin
- `SYSTEM_ERROR` - Internal server error

---

## Business Logic Requirements

### Permission System
```typescript
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

### Security Requirements
1. **Password Policy**: Minimum 8 characters, mixed case, numbers, special characters
2. **Session Management**: Configurable timeout, automatic cleanup
3. **Rate Limiting**: Configurable API rate limits per endpoint
4. **Audit Logging**: Log all admin actions with timestamps and user info
5. **Email Notifications**: Send alerts for critical actions and system changes

### Database Schema Requirements

#### admins Table
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE TABLE admin_permissions (
  admin_id UUID REFERENCES admins(id),
  permission VARCHAR(100) NOT NULL,
  PRIMARY KEY (admin_id, permission)
);

CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_by UUID REFERENCES admins(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Email Templates Required
1. **Admin Welcome Email** - New admin creation with temporary password
2. **Password Reset Email** - Temporary password for admin
3. **Status Change Notification** - Admin activated/deactivated
4. **Settings Change Alert** - Critical system setting changes
5. **Account Deletion Notification** - Admin account deleted

### Environment Variables
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

---

## Testing Requirements

### Unit Tests
- All endpoint handlers
- Permission validation logic
- Data validation functions
- Email sending functionality

### Integration Tests
- Complete admin CRUD operations
- Permission-based access control
- System settings updates
- Audit logging functionality

### API Tests
- All endpoints with valid/invalid data
- Authentication and authorization
- Error handling scenarios
- Rate limiting functionality

---

## Implementation Priority

1. **Phase 1** (Critical): Admin CRUD operations, basic permissions
2. **Phase 2** (High): System settings, audit logging
3. **Phase 3** (Medium): Advanced filtering, email notifications
4. **Phase 4** (Low): Advanced security features, reporting

This documentation provides a complete specification for implementing the admin settings backend functionality. All endpoints should be thoroughly tested and secured before deployment.
