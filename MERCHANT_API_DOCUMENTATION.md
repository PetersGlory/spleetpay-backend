# SpleetPay Merchant API Documentation

## Overview

This document provides comprehensive documentation for the SpleetPay Merchant API endpoints. The merchant API allows businesses to register as merchants, manage their profiles, submit KYC documents, generate QR codes for payments, and access analytics for their business operations.

## Base URL

- **Development**: `http://localhost:4500/api`
- **Production**: `https://spleetpay-backend.onrender.com/api`

## Authentication

All merchant endpoints require authentication using a Bearer token in the Authorization header. Merchants must first register as users, then register as merchants.

```http
Authorization: Bearer <user_jwt_token>
```

### Getting Started

1. **Register as User**: Use the user registration endpoint first
2. **Login as User**: Get authentication token
3. **Register as Merchant**: Convert user account to merchant account
4. **Complete KYC**: Submit business information and documents
5. **Get Approved**: Wait for admin approval
6. **Generate API Key**: Get your merchant API key for integrations

## API Endpoints

### 1. Merchant Registration & Profile

#### Register as Merchant
Convert an existing user account into a merchant account.

```http
POST /api/merchants/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "Tech Store Ltd",
  "businessEmail": "business@techstore.com",
  "businessPhone": "+2348012345678",
  "businessAddress": "123 Tech Street, Lagos",
  "businessType": "retail",
  "websiteUrl": "https://techstore.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "businessName": "Tech Store Ltd",
    "businessEmail": "business@techstore.com",
    "businessPhone": "+2348012345678",
    "businessAddress": "123 Tech Street, Lagos",
    "businessType": "retail",
    "websiteUrl": "https://techstore.com",
    "onboardingStatus": "draft",
    "kycStatus": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Merchant registration initiated successfully"
}
```

#### Get Merchant Profile
Retrieve the merchant's profile information including KYC documents and directors.

```http
GET /api/merchants/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "businessName": "Tech Store Ltd",
    "businessEmail": "business@techstore.com",
    "businessPhone": "+2348012345678",
    "businessAddress": "123 Tech Street, Lagos",
    "businessType": "retail",
    "websiteUrl": "https://techstore.com",
    "cacNumber": "RC123456789",
    "kycStatus": "approved",
    "onboardingStatus": "active",
    "settlementAccountNumber": "1234567890",
    "settlementBankCode": "044",
    "settlementAccountName": "Tech Store Ltd",
    "apiKey": "sk_live_...",
    "kycSubmittedAt": "2024-01-01T00:00:00.000Z",
    "kycApprovedAt": "2024-01-02T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "kycDocuments": [
      {
        "id": "uuid",
        "documentType": "cac_certificate",
        "fileName": "cac_certificate.pdf",
        "fileUrl": "https://s3.amazonaws.com/...",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "status": "approved"
      }
    ],
    "directors": [
      {
        "id": "uuid",
        "fullName": "John Doe",
        "bvn": "12345678901",
        "phone": "+2348012345678",
        "email": "john@techstore.com",
        "ownershipPercentage": 60
      }
    ]
  }
}
```

#### Update Merchant Profile
Update merchant business information.

```http
PUT /api/merchants/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "Tech Store Ltd",
  "businessEmail": "business@techstore.com",
  "businessPhone": "+2348012345678",
  "businessAddress": "123 Tech Street, Lagos",
  "businessType": "retail",
  "websiteUrl": "https://techstore.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "Tech Store Ltd",
    "businessEmail": "business@techstore.com",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

### 2. KYC (Know Your Customer) Management

#### Submit KYC Information
Submit complete KYC information including business details and directors.

```http
POST /api/merchants/kyc/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessName": "Tech Store Ltd",
  "businessEmail": "business@techstore.com",
  "businessPhone": "+2348012345678",
  "businessAddress": "123 Tech Street, Lagos",
  "cacNumber": "RC123456789",
  "businessType": "retail",
  "websiteUrl": "https://techstore.com",
  "settlementAccount": {
    "accountNumber": "1234567890",
    "bankCode": "044",
    "accountName": "Tech Store Ltd"
  },
  "directors": [
    {
      "fullName": "John Doe",
      "bvn": "12345678901",
      "phone": "+2348012345678",
      "email": "john@techstore.com",
      "ownershipPercentage": 60
    },
    {
      "fullName": "Jane Smith",
      "bvn": "12345678902",
      "phone": "+2348012345679",
      "email": "jane@techstore.com",
      "ownershipPercentage": 40
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "Tech Store Ltd",
    "kycStatus": "submitted",
    "onboardingStatus": "submitted",
    "kycSubmittedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "KYC information submitted successfully"
}
```

#### Upload KYC Document
Upload required KYC documents (CAC certificate, tax certificate, etc.).

```http
POST /api/merchants/kyc/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "documentType": "cac_certificate",
  "document": <file>
}
```

**Supported Document Types:**
- `cac_certificate` - Certificate of Incorporation
- `tax_certificate` - Tax Clearance Certificate
- `bank_statement` - Bank Statement
- `utility_bill` - Utility Bill
- `director_id` - Director ID Document
- `business_license` - Business License

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "merchantId": "uuid",
    "documentType": "cac_certificate",
    "fileName": "cac_certificate.pdf",
    "fileUrl": "https://s3.amazonaws.com/...",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "status": "pending"
  },
  "message": "Document uploaded successfully"
}
```

### 3. API Key Management

#### Generate API Key
Generate a new API key for merchant integrations (requires approved KYC).

```http
POST /api/merchants/api-key/generate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "sk_live_1234567890abcdef..."
  },
  "message": "API key generated successfully"
}
```

### 4. QR Code Management

#### Generate QR Code
Create a QR code for payment collection.

```http
POST /api/qr-codes/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Lunch Payment",
  "type": "pay_for_me",
  "amount": 5000.00,
  "description": "Team lunch payment",
  "usageLimit": 10,
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**QR Code Types:**
- `pay_for_me` - Single person payment
- `group_split` - Group payment split

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "merchantId": "uuid",
    "name": "Lunch Payment",
    "type": "pay_for_me",
    "amount": 5000.00,
    "description": "Team lunch payment",
    "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
    "paymentLink": "https://pay.spleetpay.com/link/abc123",
    "usageLimit": 10,
    "usageCount": 0,
    "isActive": true,
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "QR code generated successfully"
}
```

#### Get QR Codes
Retrieve all QR codes for the merchant.

```http
GET /api/qr-codes?page=1&limit=20&type=pay_for_me&isActive=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (`pay_for_me`, `group_split`)
- `isActive` (optional): Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCodes": [
      {
        "id": "uuid",
        "name": "Lunch Payment",
        "type": "pay_for_me",
        "amount": 5000.00,
        "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
        "usageCount": 5,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

#### Get QR Code by ID
Retrieve a specific QR code.

```http
GET /api/qr-codes/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "merchantId": "uuid",
    "name": "Lunch Payment",
    "type": "pay_for_me",
    "amount": 5000.00,
    "description": "Team lunch payment",
    "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
    "paymentLink": "https://pay.spleetpay.com/link/abc123",
    "usageLimit": 10,
    "usageCount": 5,
    "isActive": true,
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### Update QR Code
Update QR code details.

```http
PUT /api/qr-codes/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Lunch Payment",
  "amount": 6000.00,
  "description": "Updated team lunch payment",
  "usageLimit": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Lunch Payment",
    "amount": 6000.00,
    "description": "Updated team lunch payment",
    "usageLimit": 15,
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "message": "QR code updated successfully"
}
```

#### Deactivate QR Code
Deactivate a QR code.

```http
DELETE /api/qr-codes/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "QR code deactivated successfully"
}
```

#### Get QR Code Statistics
Retrieve QR code usage statistics.

```http
GET /api/qr-codes/stats/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQRCodes": 25,
    "activeQRCodes": 20,
    "totalUsage": 150,
    "payForMeCount": 15,
    "groupSplitCount": 10,
    "topQRCodes": [
      {
        "id": "uuid",
        "name": "Lunch Payment",
        "type": "pay_for_me",
        "usageCount": 25,
        "amount": 5000.00
      }
    ]
  }
}
```

### 5. Analytics & Statistics

#### Get Merchant Dashboard Analytics
Retrieve comprehensive analytics for the merchant dashboard.

```http
GET /api/analytics/dashboard?startDate=2024-01-01&endDate=2024-01-31
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
      "totalTransactions": 150,
      "completedTransactions": 145,
      "totalRevenue": 750000.00,
      "pendingAmount": 25000.00,
      "successRate": 96.7,
      "averageTransactionValue": 5000.00
    },
    "recentTransactions": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "status": "completed",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "monthlyRevenue": [
      {
        "month": "2024-01",
        "revenue": 250000.00,
        "transactionCount": 50
      }
    ]
  }
}
```

#### Get Transaction Analytics
Retrieve detailed transaction analytics.

```http
GET /api/analytics/transactions?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionBreakdown": {
      "payForMe": {
        "count": 100,
        "totalAmount": 500000.00,
        "averageAmount": 5000.00
      },
      "groupSplit": {
        "count": 50,
        "totalAmount": 250000.00,
        "averageAmount": 5000.00
      }
    },
    "statusBreakdown": {
      "completed": 145,
      "pending": 3,
      "failed": 2
    },
    "dailyTransactions": [
      {
        "date": "2024-01-15",
        "count": 5,
        "amount": 25000.00
      }
    ]
  }
}
```

#### Get Revenue Analytics
Retrieve revenue analytics and trends.

```http
GET /api/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 750000.00,
    "monthlyRevenue": [
      {
        "month": "2024-01",
        "revenue": 250000.00,
        "growth": 15.5
      }
    ],
    "revenueByType": {
      "payForMe": 500000.00,
      "groupSplit": 250000.00
    },
    "averageRevenuePerTransaction": 5000.00
  }
}
```

#### Get Merchant Statistics
Retrieve basic merchant statistics.

```http
GET /api/merchants/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 150,
    "completedTransactions": 145,
    "totalRevenue": 750000.00,
    "pendingAmount": 25000.00,
    "recentTransactions": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "status": "completed",
        "type": "pay_for_me",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

#### Generate Custom Report
Generate a custom analytics report.

```http
POST /api/analytics/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportType": "transactions",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "json"
}
```

**Report Types:**
- `transactions` - Transaction report
- `revenue` - Revenue report
- `merchant_dashboard` - Dashboard data

**Response:**
```json
{
  "success": true,
  "data": {
    "reportType": "transactions",
    "generatedAt": "2024-01-15T00:00:00.000Z",
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "data": {
      "totalTransactions": 150,
      "completedTransactions": 145,
      "totalRevenue": 750000.00
    }
  },
  "message": "Report generated successfully"
}
```

## Merchant Status Flow

### Onboarding Status
1. **draft** - Initial registration
2. **submitted** - KYC information submitted
3. **approved** - Admin approved the application
4. **active** - Merchant can start operations

### KYC Status
1. **pending** - Initial status
2. **submitted** - Documents submitted for review
3. **approved** - KYC approved by admin
4. **rejected** - KYC rejected (with reason)

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
- `CONFLICT`: Resource already exists
- `KYC_NOT_APPROVED`: KYC must be approved for this operation
- `INTERNAL_SERVER_ERROR`: Server-side error

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Rate Limiting

Merchant endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **Analytics endpoints**: 50 requests per minute
- **QR code generation**: 20 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

Merchants can receive real-time updates via WebSocket:

### Connection
```javascript
const socket = io('ws://localhost:4500', {
  auth: {
    token: 'merchant_jwt_token'
  }
});
```

### Events
- `transaction:created` - New transaction created
- `transaction:updated` - Transaction status updated
- `payment:received` - Payment received notification
- `kyc:approved` - KYC approval notification
- `kyc:rejected` - KYC rejection notification
- `qr:used` - QR code used notification

## File Upload Guidelines

### Supported File Types
- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG
- **Size Limit**: 10MB per file

### Upload Process
1. Use `multipart/form-data` content type
2. Include `documentType` field
3. File field should be named `document`
4. Receive file URL in response

## Testing

### Using cURL

```bash
# Register as merchant
curl -X POST \
  'http://localhost:4500/api/merchants/register' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessName": "Test Store",
    "businessEmail": "test@store.com",
    "businessPhone": "+2348012345678",
    "businessAddress": "123 Test Street",
    "businessType": "retail"
  }'

# Generate QR code
curl -X POST \
  'http://localhost:4500/api/qr-codes/generate' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Payment",
    "type": "pay_for_me",
    "amount": 1000.00,
    "description": "Test payment QR code"
  }'

# Get analytics
curl -X GET \
  'http://localhost:4500/api/analytics/dashboard' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Using JavaScript/Fetch

```javascript
const API_BASE = 'http://localhost:4500/api';
const token = 'YOUR_MERCHANT_TOKEN';

// Get merchant profile
const profile = await fetch(`${API_BASE}/merchants/profile`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// Generate QR code
const qrCode = await fetch(`${API_BASE}/qr-codes/generate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Lunch Payment',
    type: 'pay_for_me',
    amount: 5000.00,
    description: 'Team lunch payment'
  })
}).then(res => res.json());

// Upload KYC document
const formData = new FormData();
formData.append('documentType', 'cac_certificate');
formData.append('document', fileInput.files[0]);

const upload = await fetch(`${API_BASE}/merchants/kyc/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
}).then(res => res.json());
```

## Integration Examples

### Payment Link Integration
```javascript
// Generate QR code and use payment link
const qrCode = await generateQRCode({
  name: 'Product Payment',
  type: 'pay_for_me',
  amount: 10000.00,
  description: 'Payment for product purchase'
});

// Use the payment link in your checkout flow
window.location.href = qrCode.data.paymentLink;
```

### Webhook Integration
```javascript
// Set up webhook endpoint to receive payment notifications
app.post('/webhook/payment', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'payment.completed') {
    // Handle completed payment
    console.log('Payment completed:', data);
  }
  
  res.status(200).json({ received: true });
});
```

## Support

For technical support or questions about the merchant API:

- **Email**: merchant-support@spleetpay.com
- **Documentation**: https://docs.spleetpay.com/merchant-api
- **Status Page**: https://status.spleetpay.com
- **API Status**: Check `/health` endpoint for service status

---

**Last Updated**: January 2024  
**API Version**: v1.0.0  
**Documentation Version**: 1.0.0
