# SpleetPay Admin API Documentation

This document provides comprehensive documentation for the SpleetPay Admin API endpoints. These endpoints are designed for administrative access to manage users, merchants, transactions, wallets, QR codes, and payment rates.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Common Response Format](#common-response-format)
4. [Error Handling](#error-handling)
5. [Admin Endpoints](#admin-endpoints)
   - [Dashboard Analytics](#dashboard-analytics)
   - [User Management](#user-management)
   - [Merchant Management](#merchant-management)
   - [Transaction Management](#transaction-management)
   - [Payment Rate Management](#payment-rate-management)
   - [Wallet Management](#wallet-management)
   - [QR Code Management](#qr-code-management)
   - [Analytics & Reporting](#analytics--reporting)

## Authentication

All admin endpoints require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Base URL

```
https://api.spleetpay.com/admin
```

## Common Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string (optional),
  "error": {
    "code": string,
    "message": string
  } (only on error)
}
```

## Error Handling

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin access required)
- `404` - Not Found
- `500` - Internal Server Error

## Admin Endpoints

### Dashboard Analytics

#### Get Admin Dashboard Analytics
```http
GET /admin/dashboard
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics (YYYY-MM-DD)
- `endDate` (optional): End date for analytics (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1500,
      "totalMerchants": 250,
      "activeMerchants": 200,
      "totalTransactions": 5000,
      "completedTransactions": 4800,
      "totalRevenue": 2500000.50,
      "totalFees": 37500.75,
      "pendingSettlements": 25,
      "successRate": 96.0
    }
  }
}
```

### User Management

#### Get All Users
```http
GET /admin/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `accountStatus` (optional): Filter by status (`active`, `suspended`, `closed`)
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
        "phoneNumber": "+1234567890",
        "accountStatus": "active",
        "kycStatus": "verified",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 1500,
      "page": 1,
      "limit": 20,
      "totalPages": 75
    }
  }
}
```

#### Get User by ID
```http
GET /admin/users/{id}
```

#### Update User
```http
PUT /admin/users/{id}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "accountStatus": "active",
  "kycStatus": "verified"
}
```

#### Delete User
```http
DELETE /admin/users/{id}
```

### Merchant Management

#### Get All Merchants
```http
GET /admin/merchants
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `kycStatus` (optional): Filter by KYC status (`pending`, `submitted`, `approved`, `rejected`)
- `onboardingStatus` (optional): Filter by status (`draft`, `submitted`, `approved`, `active`)
- `search` (optional): Search by business name or email

#### Get Merchant by ID
```http
GET /admin/merchants/{id}
```

#### Update Merchant
```http
PUT /admin/merchants/{id}
```

**Request Body:**
```json
{
  "businessName": "Acme Corp",
  "businessEmail": "contact@acme.com",
  "businessPhone": "+1234567890",
  "businessAddress": "123 Business St",
  "businessType": "retail",
  "websiteUrl": "https://acme.com",
  "kycStatus": "approved",
  "onboardingStatus": "active"
}
```

#### Approve/Reject Merchant
```http
PUT /admin/merchants/{id}/approve
```

**Request Body:**
```json
{
  "approved": true
}
```

### Transaction Management

#### Get All Transactions
```http
GET /admin/transactions
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`pending`, `partial`, `completed`, `failed`, `cancelled`)
- `type` (optional): Filter by type (`pay_for_me`, `group_split`)
- `merchantId` (optional): Filter by merchant ID
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `search` (optional): Search by reference, customer name, or email

#### Get Transaction by ID
```http
GET /admin/transactions/{id}
```

#### Cancel Transaction
```http
PUT /admin/transactions/{id}/cancel
```

#### Send Payment Reminders
```http
POST /admin/transactions/{id}/reminders
```

### Payment Rate Management

#### Get All Payment Rates
```http
GET /admin/payment-rates
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Create Payment Rate
```http
POST /admin/payment-rates
```

**Request Body:**
```json
{
  "title": "Standard Rate",
  "ratePercentage": 2.5,
  "slugType": "standard"
}
```

#### Get Payment Rate by ID
```http
GET /admin/payment-rates/{id}
```

#### Update Payment Rate
```http
PUT /admin/payment-rates/{id}
```

**Request Body:**
```json
{
  "title": "Updated Rate",
  "ratePercentage": 3.0,
  "slugType": "premium"
}
```

#### Delete Payment Rate
```http
DELETE /admin/payment-rates/{id}
```

### Wallet Management

#### Get All Wallets
```http
GET /admin/wallets
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `userId` (optional): Filter by user ID
- `currency` (optional): Filter by currency

**Response:**
```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "uuid",
        "userId": "uuid",
        "balance": 1500.75,
        "currency": "NGN",
        "isActive": true,
        "user": {
          "id": "uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "total": 1200,
      "page": 1,
      "limit": 20,
      "totalPages": 60
    }
  }
}
```

#### Get User Wallet
```http
GET /admin/wallets/{userId}
```

#### Update User Wallet Balance
```http
PUT /admin/wallets/{userId}
```

**Request Body:**
```json
{
  "balance": 2000.00,
  "reason": "Account adjustment"
}
```

#### Get User Wallet Transactions
```http
GET /admin/wallets/{userId}/transactions
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (`credit`, `debit`)
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

### QR Code Management

#### Get All QR Codes
```http
GET /admin/qr-codes
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `merchantId` (optional): Filter by merchant ID
- `type` (optional): Filter by type (`pay_for_me`, `group_split`)
- `isActive` (optional): Filter by active status (boolean)

#### Get QR Code by ID
```http
GET /admin/qr-codes/{id}
```

#### Update QR Code
```http
PUT /admin/qr-codes/{id}
```

**Request Body:**
```json
{
  "name": "Updated QR Code",
  "amount": 1000.00,
  "description": "Updated description",
  "usageLimit": 100,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Deactivate QR Code
```http
DELETE /admin/qr-codes/{id}
```

### Analytics & Reporting

#### Get Transaction Analytics
```http
GET /admin/analytics/transactions
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `merchantId` (optional): Filter by merchant ID
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `status` (optional): Filter by status
- `type` (optional): Filter by type

#### Get Revenue Analytics
```http
GET /admin/analytics/revenue
```

**Query Parameters:**
- `merchantId` (optional): Filter by merchant ID
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `groupBy` (optional): Group by period (`day`, `week`, `month`, `year`) - default: `day`

#### Generate Custom Report
```http
POST /admin/analytics/reports
```

**Request Body:**
```json
{
  "reportType": "transactions",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "merchantId": "uuid",
  "format": "json"
}
```

**Report Types:**
- `transactions` - Transaction analytics report
- `revenue` - Revenue analytics report
- `merchant_dashboard` - Merchant dashboard data
- `admin_dashboard` - Admin dashboard data

**Formats:**
- `json` - JSON format (default)
- `pdf` - PDF format
- `excel` - Excel format

## Frontend Implementation Examples

### React/JavaScript Example

```javascript
// Admin API service
class AdminAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/admin${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  }

  // Get dashboard analytics
  async getDashboard(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/dashboard?${params}`);
  }

  // Get all users with pagination
  async getUsers(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return this.request(`/users?${params}`);
  }

  // Update user
  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Get all transactions
  async getTransactions(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return this.request(`/transactions?${params}`);
  }

  // Cancel transaction
  async cancelTransaction(transactionId) {
    return this.request(`/transactions/${transactionId}/cancel`, {
      method: 'PUT'
    });
  }

  // Get all wallets
  async getWallets(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return this.request(`/wallets?${params}`);
  }

  // Update wallet balance
  async updateWalletBalance(userId, balance, reason) {
    return this.request(`/wallets/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ balance, reason })
    });
  }

  // Generate report
  async generateReport(reportData) {
    return this.request('/analytics/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }
}

// Usage example
const adminAPI = new AdminAPI('https://api.spleetpay.com', 'your-admin-token');

// Get dashboard data
adminAPI.getDashboard('2024-01-01', '2024-01-31')
  .then(data => console.log('Dashboard:', data))
  .catch(error => console.error('Error:', error));

// Get users with filters
adminAPI.getUsers(1, 20, {
  accountStatus: 'active',
  kycStatus: 'verified',
  search: 'john'
})
  .then(data => console.log('Users:', data))
  .catch(error => console.error('Error:', error));
```

### TypeScript Interfaces

```typescript
// Type definitions for admin API responses
interface AdminResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  accountStatus: 'active' | 'suspended' | 'closed';
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

interface DashboardData {
  overview: {
    totalUsers: number;
    totalMerchants: number;
    activeMerchants: number;
    totalTransactions: number;
    completedTransactions: number;
    totalRevenue: number;
    totalFees: number;
    pendingSettlements: number;
    successRate: number;
  };
}

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface WalletsResponse {
  wallets: Wallet[];
  pagination: PaginationInfo;
}

// API service with TypeScript
class AdminAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getDashboard(startDate?: string, endDate?: string): Promise<AdminResponse<DashboardData>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<DashboardData>(`/dashboard?${params}`);
  }

  async getUsers(
    page: number = 1, 
    limit: number = 20, 
    filters: Record<string, string> = {}
  ): Promise<AdminResponse<UsersResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return this.request<UsersResponse>(`/users?${params}`);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<AdminResponse<T>> {
    const url = `${this.baseURL}/admin${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  }
}
```

## Error Handling Best Practices

1. **Always check the `success` field** in responses
2. **Handle specific error codes** appropriately
3. **Implement retry logic** for 5xx errors
4. **Show user-friendly error messages** based on error codes
5. **Log errors** for debugging purposes

```javascript
// Error handling example
try {
  const response = await adminAPI.getUsers();
  if (response.success) {
    // Handle successful response
    console.log(response.data.users);
  } else {
    // Handle API error
    console.error('API Error:', response.error);
  }
} catch (error) {
  // Handle network or other errors
  console.error('Network Error:', error.message);
}
```

## Rate Limiting

The admin API implements rate limiting. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response. Implement exponential backoff for retries.

## Security Notes

1. **Never expose admin tokens** in client-side code
2. **Implement proper token refresh** mechanism
3. **Use HTTPS** for all API calls
4. **Validate all inputs** before sending requests
5. **Implement proper error boundaries** in your frontend

## Support

For technical support or questions about the admin API, please contact the development team or refer to the main API documentation.
