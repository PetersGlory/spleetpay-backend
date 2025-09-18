# SpleetPay Backend API Documentation

## Overview

SpleetPay is a modern mobile payment application that works across e-commerce, travel, food delivery, and fintech platforms. The app supports two main use cases:

1. **"Pay for Me"** - Customers can share payment links/QR codes for others to pay on their behalf
2. **"Group Split Payment"** - Bills can be split equally or unequally among participants

## Key Features

- **Multi-currency Support**: NGN (Nigerian Naira), GHS (Ghanaian Cedi), GBP (British Pound), USD (US Dollar)
- **Secure Payment Links**: Generate unique, secure payment URLs with expiration
- **QR Code Integration**: Generate QR codes for payment links
- **Multi-channel Sharing**: WhatsApp, SMS, Email integration for link distribution
- **Virtual Wallet System**: User accounts with balance tracking and transaction history
- **Real-time Payment Tracking**: Live status updates for payment collection
- **Optional Tip Functionality**: All payments support optional tipping
- **Responsive Design**: Mobile-first with desktop web support

## Technology Stack Requirements

### Backend Framework
- **Recommended**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL or MongoDB
- **Cache**: Redis for session management and temporary data
- **Queue System**: Bull (Node.js) or Celery (Python) for background jobs

### Payment Processing
- **Primary**: Flutterwave, Paystack, or Stripe
- **Currency Exchange**: XE API or similar for real-time rates
- **Webhook Processing**: Secure endpoint handling for payment confirmations

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    preferred_currency CHAR(3) DEFAULT 'NGN',
    wallet_balance DECIMAL(15,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payment Requests Table
```sql
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type ENUM('pay_for_me', 'group_split') NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status ENUM('pending', 'partially_paid', 'completed', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP,
    payment_link VARCHAR(255) UNIQUE,
    qr_code_url VARCHAR(255),
    allow_tips BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Split Participants Table
```sql
CREATE TABLE split_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID REFERENCES payment_requests(id),
    name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    has_paid BOOLEAN DEFAULT FALSE,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    payment_method VARCHAR(100),
    paid_at TIMESTAMP,
    participant_link VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    payment_request_id UUID REFERENCES payment_requests(id),
    participant_id UUID REFERENCES split_participants(id),
    amount DECIMAL(15,2) NOT NULL,
    tip_amount DECIMAL(15,2) DEFAULT 0.00,
    currency CHAR(3) NOT NULL,
    payment_method VARCHAR(100),
    payment_provider VARCHAR(50),
    provider_transaction_id VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Wallet Transactions Table
```sql
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    transaction_id UUID REFERENCES transactions(id),
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    description TEXT,
    balance_after DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Create new user account
```json
{
  "email": "user@example.com",
  "phone": "+2348123456789",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securePassword123",
  "preferred_currency": "NGN"
}
```

#### POST /api/auth/login
**Description**: User login
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST /api/auth/verify-email
**Description**: Verify user email with OTP
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### POST /api/auth/forgot-password
**Description**: Initiate password reset
```json
{
  "email": "user@example.com"
}
```

### Payment Request Endpoints

#### POST /api/payments/create
**Description**: Create new payment request (Pay for Me)
```json
{
  "type": "pay_for_me",
  "description": "Dinner at Restaurant XYZ",
  "amount": 15000.00,
  "currency": "NGN",
  "expires_in_hours": 24,
  "allow_tips": true
}
```

#### POST /api/payments/split/create
**Description**: Create group split payment
```json
{
  "type": "group_split",
  "description": "Weekend Trip Expenses",
  "total_amount": 50000.00,
  "currency": "NGN",
  "participants": [
    {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+2348123456789",
      "amount": 12500.00
    },
    {
      "name": "Bob Smith",
      "email": "bob@example.com",
      "amount": 12500.00
    }
  ],
  "split_type": "unequal", // or "equal"
  "expires_in_hours": 48,
  "allow_tips": true
}
```

#### GET /api/payments/:paymentId
**Description**: Get payment request details
```json
{
  "id": "uuid",
  "type": "group_split",
  "description": "Weekend Trip Expenses",
  "amount": 50000.00,
  "currency": "NGN",
  "status": "partially_paid",
  "payment_link": "https://pay.spleetpay.com/p/abc123",
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?data=...",
  "participants": [...],
  "total_collected": 25000.00,
  "created_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-17T10:30:00Z"
}
```

#### GET /api/payments/link/:linkToken
**Description**: Access payment via public link (no auth required)

#### POST /api/payments/:paymentId/participants/:participantId/pay
**Description**: Process payment for specific participant
```json
{
  "amount": 12500.00,
  "tip_amount": 1500.00,
  "payment_method": "card",
  "payment_details": {
    "card_number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123",
    "cardholder_name": "John Doe"
  }
}
```

### Wallet Endpoints

#### GET /api/wallet/balance
**Description**: Get user wallet balance
```json
{
  "balance": 25000.00,
  "currency": "NGN",
  "last_updated": "2024-01-15T10:30:00Z"
}
```

#### GET /api/wallet/transactions
**Description**: Get wallet transaction history
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "credit",
      "amount": 5000.00,
      "description": "Payment received from Alice",
      "balance_after": 25000.00,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### POST /api/wallet/withdraw
**Description**: Withdraw funds from wallet
```json
{
  "amount": 10000.00,
  "withdrawal_method": "bank_transfer",
  "bank_details": {
    "account_number": "1234567890",
    "bank_code": "044",
    "account_name": "John Doe"
  }
}
```

### Payment History Endpoints

#### GET /api/payments/history
**Description**: Get user's payment history
```json
{
  "payments": [
    {
      "id": "uuid",
      "type": "group_split",
      "description": "Weekend Trip",
      "amount": 50000.00,
      "status": "completed",
      "participants_count": 4,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

### Utility Endpoints

#### GET /api/utils/exchange-rates
**Description**: Get current exchange rates
```json
{
  "base_currency": "NGN",
  "rates": {
    "USD": 0.0012,
    "GBP": 0.00098,
    "GHS": 0.125
  },
  "last_updated": "2024-01-15T10:30:00Z"
}
```

#### POST /api/utils/send-notification
**Description**: Send payment reminders
```json
{
  "type": "whatsapp", // or "sms", "email"
  "recipient": "+2348123456789",
  "message": "You have a pending payment of ₦12,500 for Weekend Trip",
  "payment_link": "https://pay.spleetpay.com/p/abc123"
}
```

## Webhook Endpoints

### POST /api/webhooks/payment-provider
**Description**: Handle payment provider webhooks (Flutterwave, Paystack, etc.)
```json
{
  "event": "charge.success",
  "data": {
    "id": "provider_tx_id",
    "amount": 12500,
    "currency": "NGN",
    "customer": {
      "email": "customer@example.com"
    },
    "metadata": {
      "payment_request_id": "uuid",
      "participant_id": "uuid"
    }
  }
}
```

## Real-time Updates

### WebSocket Events

#### Connection
```javascript
// Client connects to: wss://api.spleetpay.com/ws
// Authentication via JWT token in query params
```

#### Events to Emit
```javascript
// Join payment room
{
  "event": "join_payment",
  "data": {
    "payment_id": "uuid"
  }
}

// Payment status update
{
  "event": "payment_update",
  "data": {
    "payment_id": "uuid",
    "participant_id": "uuid",
    "status": "completed",
    "amount_paid": 12500.00,
    "total_collected": 37500.00
  }
}
```

## Security Requirements

### Authentication & Authorization
- **JWT Tokens**: 15-minute access tokens, 7-day refresh tokens
- **Rate Limiting**: 100 requests per minute per IP
- **API Key Authentication**: For webhook endpoints
- **CORS Configuration**: Restrict to approved domains

### Data Encryption
- **At Rest**: AES-256 encryption for sensitive data
- **In Transit**: TLS 1.3 for all API communications
- **PII Protection**: Hash/encrypt email addresses and phone numbers

### Payment Security
- **PCI DSS Compliance**: Never store card details directly
- **Webhook Validation**: Verify signatures from payment providers
- **Idempotency**: Prevent duplicate transactions
- **Fraud Detection**: Implement velocity checks and anomaly detection

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/spleetpay
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# Payment Providers
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@spleetpay.com

# Exchange Rates
EXCHANGE_API_KEY=your-exchange-api-key

# App Configuration
APP_ENV=production
API_BASE_URL=https://api.spleetpay.com
FRONTEND_URL=https://spleetpay.com
PAYMENT_LINK_DOMAIN=https://pay.spleetpay.com

# File Storage (for QR codes)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=spleetpay-assets
AWS_REGION=us-east-1
```

## Background Jobs

### Payment Processing Queue
```javascript
// Job types
{
  "send_payment_reminder": {
    "participant_id": "uuid",
    "reminder_count": 1,
    "delay": "24h"
  },
  "expire_payment_request": {
    "payment_id": "uuid",
    "expires_at": "2024-01-17T10:30:00Z"
  },
  "process_webhook": {
    "provider": "flutterwave",
    "webhook_data": {...},
    "signature": "webhook-signature"
  },
  "generate_qr_code": {
    "payment_id": "uuid",
    "payment_link": "https://pay.spleetpay.com/p/abc123"
  }
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "INVALID_PAYMENT_AMOUNT",
    "message": "Payment amount must be greater than ₦100",
    "details": {
      "field": "amount",
      "minimum_amount": 100,
      "provided_amount": 50
    }
  },
  "request_id": "req_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes
- `INVALID_CREDENTIALS` - Authentication failed
- `INSUFFICIENT_BALANCE` - Wallet balance too low
- `PAYMENT_EXPIRED` - Payment link has expired
- `DUPLICATE_TRANSACTION` - Transaction already processed
- `PAYMENT_FAILED` - Payment processing failed
- `INVALID_CURRENCY` - Unsupported currency
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Deployment Requirements

### Infrastructure
- **Load Balancer**: Nginx or AWS ALB
- **Application Servers**: At least 2 instances for high availability
- **Database**: Primary with read replicas
- **Cache**: Redis cluster for session management
- **Queue Workers**: Separate instances for background job processing

### Monitoring & Logging
- **APM**: New Relic, DataDog, or similar
- **Error Tracking**: Sentry integration
- **Logs**: Structured JSON logging with correlation IDs
- **Metrics**: Payment success rates, response times, error rates

### Backup & Recovery
- **Database Backups**: Daily automated backups with 30-day retention
- **Point-in-time Recovery**: Ability to restore to any point within 7 days
- **Disaster Recovery**: Cross-region backup strategy

## Testing Requirements

### Unit Tests
- **Coverage**: Minimum 80% code coverage
- **Payment Logic**: Comprehensive testing of split calculations
- **Webhook Processing**: Mock payment provider responses
- **Currency Conversion**: Test exchange rate calculations

### Integration Tests
- **Payment Flows**: End-to-end payment processing
- **Webhook Handling**: Real webhook simulation
- **Database Transactions**: ACID compliance testing
- **Rate Limiting**: API throttling verification

### Performance Tests
- **Load Testing**: 1000 concurrent users
- **Payment Processing**: Sub-3-second response times
- **Database Performance**: Query optimization verification
- **Memory Usage**: Monitor for memory leaks

## Compliance & Legal

### Data Protection
- **GDPR Compliance**: For European users
- **CCPA Compliance**: For California users
- **Data Retention**: 7-year transaction history retention
- **Right to Deletion**: User data deletion capabilities

### Financial Regulations
- **AML Compliance**: Anti-money laundering checks
- **KYC Requirements**: Know Your Customer verification
- **Transaction Reporting**: Regulatory reporting capabilities
- **Audit Trail**: Immutable transaction logs

## Support & Documentation

### API Documentation
- **Interactive Docs**: Swagger/OpenAPI specification
- **Code Examples**: SDKs for popular languages
- **Webhook Testing**: Sandbox environment for development
- **Postman Collection**: Ready-to-use API collection

### Developer Resources
- **Sandbox Environment**: Full-featured test environment
- **Test Cards**: Comprehensive test card database
- **Webhook Simulator**: Tool for testing webhook handling
- **Status Page**: Real-time API status and uptime

This comprehensive backend documentation provides all the necessary information for implementing a robust, secure, and scalable payment processing system for SpleetPay.