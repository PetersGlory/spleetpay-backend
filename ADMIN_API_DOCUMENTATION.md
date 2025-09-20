# SpleetPay Admin API Documentation

## Overview

This document provides comprehensive documentation for the SpleetPay Admin API endpoints. The admin API allows administrators to manage users, merchants, transactions, and view analytics for the SpleetPay payment platform.

## Base URL

- **Development**: `http://localhost:3000/api/admin`
- **Production**: `https://spleetpay-backend.onrender.com/api/admin`

## Authentication

All admin endpoints require authentication using a Bearer token in the Authorization header.

```http
Authorization: Bearer <admin_jwt_token>
```

### Admin Login

To obtain an admin token, use the admin login endpoint:

```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@spleetpay.com",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "adminUser": {
      "id": "uuid",
      "email": "admin@spleetpay.com",
      "name": "Admin User",
      "role": "super_admin",
      "permissions": ["user:read", "user:write", "merchant:read", "merchant:write"],
      "department": "Operations",
      "status": "active",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "Admin login successful"
}
```

## Admin Roles and Permissions

### Roles
- **super_admin**: Full system access
- **admin**: Administrative access with restrictions
- **moderator**: Limited administrative access
- **analyst**: Read-only access to analytics

### Permissions
- `user:read` - View user information
- `user:write` - Modify user information
- `merchant:read` - View merchant information
- `merchant:write` - Approve/reject merchants
- `transaction:read` - View transaction data
- `analytics:read` - Access analytics dashboard

## API Endpoints

### 1. Dashboard Analytics

#### Get Admin Dashboard
Retrieve comprehensive analytics for the admin dashboard.

```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "totalMerchants": 45,
      "activeMerchants": 38,
      "totalTransactions": 5670,
      "completedTransactions": 5234,
      "totalRevenue": 1250000.50,
      "totalFees": 37500.15,
      "pendingSettlements": 12,
      "successRate": 92.3
    },
    "recentTransactions": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "currency": "NGN",
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "topMerchants": [
      {
        "id": "uuid",
        "businessName": "Tech Store",
        "totalVolume": 250000.00,
        "transactionCount": 125
      }
    ]
  }
}
```

### 2. Transaction Management

#### Get All Transactions
Retrieve all transactions with filtering and pagination.

```http
GET /api/admin/transactions
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`pending`, `partial`, `completed`, `failed`, `cancelled`)
- `type` (optional): Filter by type (`pay_for_me`, `group_split`)
- `merchantId` (optional): Filter by merchant ID
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "paymentRequestId": "uuid",
        "amount": 5000.00,
        "currency": "NGN",
        "status": "completed",
        "paymentMethod": "card",
        "paymentProvider": "paystack",
        "providerTransactionId": "paystack_ref",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:05:00.000Z",
        "user": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "paymentRequest": {
          "id": "uuid",
          "description": "Group dinner payment",
          "type": "group_split"
        }
      }
    ],
    "pagination": {
      "total": 5670,
      "page": 1,
      "limit": 20,
      "totalPages": 284
    }
  }
}
```

#### Get Transaction by ID
Retrieve a specific transaction with full details.

```http
GET /api/admin/transactions/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "paymentRequestId": "uuid",
    "participantId": "uuid",
    "amount": 5000.00,
    "tipAmount": 250.00,
    "currency": "NGN",
    "status": "completed",
    "paymentMethod": "card",
    "paymentProvider": "paystack",
    "providerTransactionId": "paystack_ref",
    "gatewayResponse": {
      "status": "success",
      "reference": "paystack_ref",
      "amount": 5250.00
    },
    "metadata": {
      "device": "mobile",
      "ip": "192.168.1.1"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z",
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "paymentRequest": {
      "id": "uuid",
      "description": "Group dinner payment",
      "type": "group_split",
      "totalAmount": 20000.00
    },
    "participant": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "amountDue": 5000.00,
      "hasPaid": true
    }
  }
}
```

### 3. Merchant Management

#### Get All Merchants
Retrieve all merchants with filtering and pagination.

```http
GET /api/admin/merchants
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `kycStatus` (optional): Filter by KYC status (`pending`, `submitted`, `approved`, `rejected`)
- `onboardingStatus` (optional): Filter by onboarding status (`draft`, `submitted`, `approved`, `active`)
- `search` (optional): Search by business name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "id": "uuid",
        "userId": "uuid",
        "businessName": "Tech Store Ltd",
        "businessType": "retail",
        "businessEmail": "business@techstore.com",
        "businessPhone": "+2348012345678",
        "kycStatus": "approved",
        "onboardingStatus": "active",
        "settlementAccount": {
          "bankName": "Access Bank",
          "accountNumber": "1234567890",
          "accountName": "Tech Store Ltd"
        },
        "apiKey": "sk_live_...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@techstore.com"
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

#### Approve/Reject Merchant
Approve or reject a merchant's KYC and onboarding application.

```http
PUT /api/admin/merchants/{id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "Tech Store Ltd",
    "kycStatus": "approved",
    "onboardingStatus": "active",
    "approvedAt": "2024-01-01T00:00:00.000Z",
    "approvedBy": "admin_uuid"
  },
  "message": "Merchant approved successfully"
}
```

### 4. User Management

#### Get All Users
Retrieve all users with filtering and pagination.

```http
GET /api/admin/users
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `accountStatus` (optional): Filter by account status (`active`, `suspended`, `closed`)
- `kycStatus` (optional): Filter by KYC status (`pending`, `verified`, `rejected`)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+2348012345678",
        "preferredCurrency": "NGN",
        "isVerified": true,
        "lastLogin": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "wallet": {
          "id": "uuid",
          "balance": 15000.00,
          "currency": "NGN"
        }
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "totalPages": 63
    }
  }
}
```

#### Get User by ID
Retrieve a specific user with full details.

```http
GET /api/admin/users/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "preferredCurrency": "NGN",
    "isVerified": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "wallet": {
      "id": "uuid",
      "balance": 15000.00,
      "currency": "NGN"
    },
    "transactions": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "currency": "NGN",
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Update User
Update user details with admin-level access.

```http
PUT /api/admin/users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "isVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "isVerified": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User updated successfully by admin"
}
```

#### Delete User
Soft delete a user account.

```http
DELETE /api/admin/users/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR`: Invalid or missing authentication token
- `AUTHORIZATION_ERROR`: Insufficient permissions for the operation
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server-side error

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Admin endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Analytics endpoints**: 50 requests per minute
- **Write operations**: 20 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

The admin dashboard can receive real-time updates via WebSocket:

### Connection
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'admin_jwt_token'
  }
});
```

### Events
- `transaction:created` - New transaction created
- `transaction:updated` - Transaction status updated
- `payment:received` - Payment received notification
- `merchant:approved` - Merchant approval status changed
- `user:verified` - User verification status changed

## Testing

### Using cURL

```bash
# Get admin dashboard
curl -X GET \
  'http://localhost:3000/api/admin/dashboard' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'

# Get all transactions
curl -X GET \
  'http://localhost:3000/api/admin/transactions?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN'

# Approve merchant
curl -X PUT \
  'http://localhost:3000/api/admin/merchants/MERCHANT_ID/approve' \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"approved": true}'
```

### Using JavaScript/Fetch

```javascript
const API_BASE = 'http://localhost:3000/api/admin';
const token = 'YOUR_ADMIN_TOKEN';

// Get dashboard data
const dashboardData = await fetch(`${API_BASE}/dashboard`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// Get transactions with filters
const transactions = await fetch(`${API_BASE}/transactions?status=completed&limit=50`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());
```

## Support

For technical support or questions about the admin API:

- **Email**: admin-support@spleetpay.com
- **Documentation**: https://docs.spleetpay.com/admin-api
- **Status Page**: https://status.spleetpay.com

---

**Last Updated**: January 2024  
**API Version**: v1.0.0  
**Documentation Version**: 1.0.0
