# SpleetPay User API Documentation

## Overview

This document provides comprehensive documentation for the SpleetPay User API endpoints. The user API allows individuals to register, manage their profiles, create payment requests, manage their wallets, and process payments for both "Pay for Me" and "Group Split" scenarios.

## Base URL

- **Development**: `http://localhost:4500/api`
- **Production**: `https://spleetpay-backend.onrender.com/api`

## Authentication

Most user endpoints require authentication using a Bearer token in the Authorization header. Users must register first and then login to get an authentication token.

```http
Authorization: Bearer <user_jwt_token>
```

### Getting Started

1. **Register**: Create a new user account
2. **Verify Email**: Complete email verification (OTP-based)
3. **Login**: Get authentication token
4. **Create Payment Requests**: Start accepting payments
5. **Manage Wallet**: Track and withdraw funds

## API Endpoints

### 1. Authentication

#### Register User
Create a new user account with email verification.

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "preferredCurrency": "NGN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+2348012345678",
      "isVerified": false,
      "accountStatus": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "User registered successfully. Please check your email to verify your account."
}
```

#### Login User
Authenticate user and get access token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+2348012345678",
      "isVerified": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "Login successful"
}
```

#### Verify Email
Verify user email using OTP.

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Forgot Password
Request password reset link.

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

#### Reset Password
Reset password using token from email.

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newsecurepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### Refresh Token
Get new access token using refresh token.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

#### Logout
Invalidate user session.

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2. User Profile Management

#### Get User Profile
Retrieve current user's profile information including wallet.

```http
GET /api/users/profile
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
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "wallet": {
      "id": "uuid",
      "balance": 50000.00,
      "currency": "NGN",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update User Profile
Update user profile information.

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "preferredCurrency": "NGN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "preferredCurrency": "NGN",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

#### Change Password
Change user password.

```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Delete Account
Soft delete user account (requires password confirmation).

```http
DELETE /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "currentpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### 3. Payment Request Management

#### Create Payment Request (Pay for Me)
Create a payment request for someone to pay for you.

```http
POST /api/users/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "pay_for_me",
  "description": "Lunch payment",
  "amount": 5000.00,
  "currency": "NGN",
  "expiresInHours": 24,
  "allowTips": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "pay_for_me",
    "description": "Lunch payment",
    "amount": 5000.00,
    "currency": "NGN",
    "status": "pending",
    "paymentLink": "https://pay.spleetpay.com/p/abc123",
    "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
    "allowTips": true,
    "expiresAt": "2024-01-02T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Payment request created successfully"
}
```

#### Create Group Split Payment
Create a group payment where multiple people split the cost.

```http
POST /api/users/payments/split/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Dinner with friends",
  "totalAmount": 15000.00,
  "currency": "NGN",
  "participants": [
    {
      "name": "Alice",
      "email": "alice@example.com",
      "phone": "+2348012345679",
      "amount": 5000.00
    },
    {
      "name": "Bob",
      "email": "bob@example.com",
      "phone": "+2348012345680",
      "amount": 5000.00
    },
    {
      "name": "Charlie",
      "email": "charlie@example.com",
      "phone": "+2348012345681",
      "amount": 5000.00
    }
  ],
  "splitType": "custom",
  "expiresInHours": 48,
  "allowTips": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "group_split",
    "description": "Dinner with friends",
    "amount": 15000.00,
    "currency": "NGN",
    "status": "pending",
    "paymentLink": "https://pay.spleetpay.com/p/abc123",
    "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
    "allowTips": true,
    "expiresAt": "2024-01-03T00:00:00.000Z",
    "totalAmount": 15000.00,
    "splitType": "custom",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "participants": [
      {
        "id": "uuid",
        "name": "Alice",
        "email": "alice@example.com",
        "phone": "+2348012345679",
        "amount": 5000.00,
        "participantLink": "https://pay.spleetpay.com/split/xyz123",
        "hasPaid": false
      },
      {
        "id": "uuid",
        "name": "Bob",
        "email": "bob@example.com",
        "phone": "+2348012345680",
        "amount": 5000.00,
        "participantLink": "https://pay.spleetpay.com/split/xyz124",
        "hasPaid": false
      },
      {
        "id": "uuid",
        "name": "Charlie",
        "email": "charlie@example.com",
        "phone": "+2348012345681",
        "amount": 5000.00,
        "participantLink": "https://pay.spleetpay.com/split/xyz125",
        "hasPaid": false
      }
    ]
  },
  "message": "Group split payment created successfully"
}
```

#### Get Payment Request Details
Retrieve details of a specific payment request.

```http
GET /api/users/payments/{paymentId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "group_split",
    "description": "Dinner with friends",
    "amount": 15000.00,
    "currency": "NGN",
    "status": "partial",
    "paymentLink": "https://pay.spleetpay.com/p/abc123",
    "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
    "totalCollected": 10000.00,
    "participants": [
      {
        "id": "uuid",
        "name": "Alice",
        "amount": 5000.00,
        "hasPaid": true,
        "paidAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "id": "uuid",
        "name": "Bob",
        "amount": 5000.00,
        "hasPaid": true,
        "paidAt": "2024-01-01T12:30:00.000Z"
      },
      {
        "id": "uuid",
        "name": "Charlie",
        "amount": 5000.00,
        "hasPaid": false
      }
    ]
  }
}
```

#### Get User Payment History
Retrieve user's payment request history with filtering options.

```http
GET /api/users/payments/history?page=1&limit=20&type=group_split&status=completed&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (`pay_for_me`, `group_split`)
- `status` (optional): Filter by status (`pending`, `partial`, `completed`, `failed`, `cancelled`)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "type": "group_split",
        "description": "Dinner with friends",
        "amount": 15000.00,
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "participants": [
          {
            "id": "uuid",
            "name": "Alice",
            "amount": 5000.00,
            "hasPaid": true
          }
        ]
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

### 4. Wallet Management

#### Get Wallet Balance
Retrieve user's wallet balance and information.

```http
GET /api/users/wallet
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 50000.00,
    "currency": "NGN",
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Wallet Transactions
Retrieve user's wallet transaction history.

```http
GET /api/users/wallet/transactions?page=1&limit=20&type=credit&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (`credit`, `debit`)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "credit",
        "amount": 5000.00,
        "currency": "NGN",
        "description": "Payment received for Lunch payment",
        "balanceAfter": 50000.00,
        "reference": "CREDIT_ABC123",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "transaction": {
          "id": "uuid",
          "amount": 5000.00,
          "currency": "NGN"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

#### Withdraw from Wallet
Withdraw funds from user's wallet to bank account.

```http
POST /api/users/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000.00,
  "withdrawalMethod": "bank_transfer",
  "bankDetails": {
    "bankName": "First Bank",
    "accountNumber": "1234567890",
    "accountName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "WDR_ABC123456",
    "amount": 10000.00,
    "currency": "NGN",
    "newBalance": 40000.00,
    "status": "pending"
  },
  "message": "Withdrawal request submitted successfully"
}
```

#### Get Wallet Statistics
Retrieve comprehensive wallet statistics.

```http
GET /api/users/wallet/stats?startDate=2024-01-01&endDate=2024-01-31
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
    "currentBalance": 50000.00,
    "totalCredits": 75000.00,
    "totalDebits": 25000.00,
    "creditTransactions": 15,
    "debitTransactions": 5,
    "netBalance": 50000.00
  }
}
```

### 5. Transaction History

#### Get User Transactions
Retrieve user's transaction history with filtering options.

```http
GET /api/users/transactions?page=1&limit=20&status=completed&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `failed`, `refunded`)
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "tipAmount": 500.00,
        "currency": "NGN",
        "status": "completed",
        "paymentMethod": "card",
        "paymentProvider": "paystack",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "paymentRequest": {
          "id": "uuid",
          "description": "Lunch payment",
          "type": "pay_for_me"
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### 6. Public Payment Access

#### Access Payment by Link
Access payment request via public link (no authentication required).

```http
GET /api/payments/link/{linkToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "pay_for_me",
    "description": "Lunch payment",
    "amount": 5000.00,
    "currency": "NGN",
    "status": "pending",
    "paymentLink": "https://pay.spleetpay.com/p/abc123",
    "qrCodeUrl": "https://api.spleetpay.com/qr/abc123",
    "allowTips": true,
    "totalCollected": 0.00,
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com"
    }
  }
}
```

#### Process Participant Payment
Process payment for a specific participant in group split (no authentication required).

```http
POST /api/payments/{paymentId}/participants/{participantId}/pay
Content-Type: application/json

{
  "amount": 5000.00,
  "tipAmount": 500.00,
  "paymentMethod": "card",
  "paymentDetails": {
    "cardNumber": "4084084084084081",
    "cvv": "408",
    "expiryMonth": "08",
    "expiryYear": "25"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "amount": 5000.00,
      "tipAmount": 500.00,
      "currency": "NGN",
      "status": "pending",
      "paymentProvider": "paystack",
      "providerTransactionId": "paystack_ref_123"
    },
    "paymentUrl": "https://checkout.paystack.com/abc123"
  },
  "message": "Payment initialized successfully"
}
```

## Payment Request Status Flow

### Status Values
- **pending**: Payment request created, waiting for payments
- **partial**: Some payments received (for group splits)
- **completed**: Full amount collected
- **failed**: Payment failed or expired
- **cancelled**: Payment request cancelled by user

### Expiration Handling
- Payment requests can have expiration dates
- Expired payments return `410 Gone` status
- Users can set `expiresInHours` when creating requests

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
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists (e.g., email already registered)
- `INVALID_PASSWORD`: Incorrect password provided
- `INSUFFICIENT_BALANCE`: Insufficient wallet balance for withdrawal
- `ALREADY_PAID`: Participant has already paid their portion
- `PAYMENT_EXPIRED`: Payment request has expired
- `AMOUNT_MISMATCH`: Payment amount doesn't match required amount
- `INTERNAL_SERVER_ERROR`: Server-side error

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `410`: Gone (Expired)
- `500`: Internal Server Error

## Rate Limiting

User endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Profile endpoints**: 60 requests per minute
- **Payment creation**: 20 requests per minute
- **Wallet operations**: 30 requests per minute
- **Transaction queries**: 100 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 55
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

Users can receive real-time updates via WebSocket:

### Connection
```javascript
const socket = io('ws://localhost:4500', {
  auth: {
    token: 'user_jwt_token'
  }
});
```

### Events
- `payment:received` - Payment received notification
- `payment:completed` - Payment request completed
- `wallet:credited` - Wallet credited notification
- `wallet:debited` - Wallet debited notification
- `transaction:updated` - Transaction status updated

## Testing

### Using cURL

```bash
# Register user
curl -X POST \
  'http://localhost:4500/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+2348012345678"
  }'

# Login
curl -X POST \
  'http://localhost:4500/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create payment request
curl -X POST \
  'http://localhost:4500/api/users/payments/create' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "pay_for_me",
    "description": "Test payment",
    "amount": 1000.00,
    "currency": "NGN"
  }'

# Get wallet balance
curl -X GET \
  'http://localhost:4500/api/users/wallet' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Using JavaScript/Fetch

```javascript
const API_BASE = 'http://localhost:4500/api';
let authToken = '';

// Register user
const register = async () => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+2348012345678'
    })
  });
  const data = await response.json();
  authToken = data.data.token;
  return data;
};

// Create group split payment
const createGroupSplit = async () => {
  const response = await fetch(`${API_BASE}/users/payments/split/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Dinner with friends',
      totalAmount: 15000.00,
      currency: 'NGN',
      participants: [
        {
          name: 'Alice',
          email: 'alice@example.com',
          amount: 5000.00
        },
        {
          name: 'Bob',
          email: 'bob@example.com',
          amount: 5000.00
        }
      ],
      splitType: 'custom'
    })
  });
  return await response.json();
};

// Get wallet balance
const getWalletBalance = async () => {
  const response = await fetch(`${API_BASE}/users/wallet`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  return await response.json();
};
```

## Integration Examples

### Payment Link Integration
```javascript
// Create payment request and share link
const createAndSharePayment = async (description, amount) => {
  const payment = await createPaymentRequest({
    type: 'pay_for_me',
    description,
    amount,
    currency: 'NGN'
  });
  
  // Share the payment link
  const shareUrl = payment.data.paymentLink;
  console.log('Share this link:', shareUrl);
  
  return payment;
};
```

### Real-time Payment Tracking
```javascript
// Set up WebSocket for real-time updates
const socket = io('ws://localhost:4500', {
  auth: { token: authToken }
});

socket.on('payment:received', (data) => {
  console.log('Payment received:', data);
  // Update UI to show payment received
});

socket.on('payment:completed', (data) => {
  console.log('Payment request completed:', data);
  // Show success message
});
```

### Wallet Management
```javascript
// Check wallet balance before withdrawal
const withdrawWithValidation = async (amount) => {
  const wallet = await getWalletBalance();
  
  if (wallet.data.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  return await withdrawFromWallet({
    amount,
    withdrawalMethod: 'bank_transfer',
    bankDetails: {
      bankName: 'First Bank',
      accountNumber: '1234567890',
      accountName: 'John Doe'
    }
  });
};
```

## Security Best Practices

### Authentication
- Always use HTTPS in production
- Store JWT tokens securely (not in localStorage for sensitive apps)
- Implement token refresh logic
- Use short-lived access tokens

### Payment Security
- Validate all payment amounts on the server
- Use secure payment providers (Paystack)
- Implement rate limiting
- Log all payment activities

### Data Protection
- Never expose sensitive user data
- Use proper input validation
- Implement CORS policies
- Regular security audits

## Support

For technical support or questions about the user API:

- **Email**: user-support@spleetpay.com
- **Documentation**: https://docs.spleetpay.com/user-api
- **Status Page**: https://status.spleetpay.com
- **API Status**: Check `/health` endpoint for service status

---

**Last Updated**: January 2024  
**API Version**: v1.0.0  
**Documentation Version**: 1.0.0
