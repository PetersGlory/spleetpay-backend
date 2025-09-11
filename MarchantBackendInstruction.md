# SpleetPay Merchant Dashboard - Backend API Documentation

## Project Overview

SpleetPay is a comprehensive payment solution that enables two main use cases:
1. **"Pay for Me"** - Where one person pays for others and can request reimbursement
2. **"Group Split Payment"** - Where bills are divided equally or unequally among multiple contributors

The system works across e-commerce, travel, food delivery, and fintech apps, with merchants able to generate QR codes/payment links that customers can use to initiate either payment flow.

## Technology Stack Requirements

### Backend Framework
- **Node.js** with Express.js or NestJS
- **TypeScript** for type safety
- **PostgreSQL** or **MongoDB** for primary database
- **Redis** for caching and session management
- **Socket.io** for real-time updates

### External Integrations
- **Payment Service Providers (PSPs)** for card, bank transfer, mobile money, and USSD payments
- **File Storage** (AWS S3, Cloudinary, or similar) for document uploads
- **Email Service** (SendGrid, Mailgun, or similar)
- **SMS Service** for notifications

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status ENUM('pending', 'active', 'suspended', 'blocked') DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Merchants Table
```sql
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    business_address TEXT,
    cac_number VARCHAR(50),
    business_type VARCHAR(100),
    website_url VARCHAR(255),
    kyc_status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
    kyc_submitted_at TIMESTAMP,
    kyc_approved_at TIMESTAMP,
    api_key VARCHAR(255) UNIQUE,
    webhook_url VARCHAR(255),
    settlement_account_number VARCHAR(20),
    settlement_bank_code VARCHAR(10),
    settlement_account_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### KYC Documents Table
```sql
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    document_type ENUM('cac_certificate', 'proof_of_address', 'identity_document', 'director_id') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Directors Table
```sql
CREATE TABLE directors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    bvn VARCHAR(11) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    ownership_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    reference VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('pay_for_me', 'group_split') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status ENUM('pending', 'partial', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    description TEXT,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    gateway_reference VARCHAR(255),
    merchant_fee DECIMAL(15,2) DEFAULT 0,
    gateway_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2),
    settlement_status ENUM('pending', 'settled', 'failed') DEFAULT 'pending',
    settled_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Group Split Contributors Table
```sql
CREATE TABLE group_split_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Settlements Table
```sql
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    settlement_date DATE,
    bank_reference VARCHAR(255),
    transaction_count INTEGER DEFAULT 0,
    settlement_type ENUM('T+0', 'T+1', 'manual') DEFAULT 'T+1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Settlement Items Table
```sql
CREATE TABLE settlement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL
);
```

### QR Codes Table
```sql
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type ENUM('pay_for_me', 'group_split') NOT NULL,
    amount DECIMAL(15,2),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    qr_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new merchant account
```json
{
  "email": "merchant@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234901234567"
}
```

#### POST /api/auth/login
Authenticate merchant
```json
{
  "email": "merchant@example.com",
  "password": "securePassword123"
}
```

#### POST /api/auth/logout
Logout current session

#### POST /api/auth/forgot-password
Request password reset
```json
{
  "email": "merchant@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token
```json
{
  "token": "reset_token",
  "newPassword": "newSecurePassword123"
}
```

### KYC Endpoints

#### POST /api/kyc/submit
Submit KYC information
```json
{
  "businessName": "ABC Company Ltd",
  "businessEmail": "business@abc.com",
  "businessPhone": "+234901234567",
  "businessAddress": "123 Business Street, Lagos",
  "cacNumber": "RC123456",
  "businessType": "Limited Liability Company",
  "websiteUrl": "https://abc.com",
  "settlementAccount": {
    "accountNumber": "1234567890",
    "bankCode": "058",
    "accountName": "ABC Company Ltd"
  },
  "directors": [
    {
      "fullName": "John Doe",
      "bvn": "12345678901",
      "phone": "+234901234567",
      "email": "john@abc.com",
      "ownershipPercentage": 60.0
    }
  ]
}
```

#### POST /api/kyc/upload-document
Upload KYC document (multipart/form-data)
```
documentType: string (cac_certificate, proof_of_address, identity_document, director_id)
file: File
```

#### GET /api/kyc/status
Get current KYC status

### Transaction Endpoints

#### GET /api/transactions
Get all transactions with filters
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- status: string (pending, partial, completed, failed)
- type: string (pay_for_me, group_split)
- startDate: ISO date string
- endDate: ISO date string
- search: string (search by reference, customer name, email)
```

#### GET /api/transactions/:id
Get transaction details

#### POST /api/transactions/create
Create new transaction
```json
{
  "type": "group_split",
  "amount": 75000,
  "description": "Team lunch payment",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+234902345678",
  "contributors": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+234901234567",
      "amount": 15000
    }
  ],
  "expiresAt": "2025-01-15T23:59:59Z"
}
```

#### PUT /api/transactions/:id/status
Update transaction status
```json
{
  "status": "completed",
  "gatewayReference": "GW123456"
}
```

### Group Split Endpoints

#### GET /api/group-splits
Get all group split transactions

#### GET /api/group-splits/:id/contributors
Get contributors for a group split transaction

#### POST /api/group-splits/:id/send-reminders
Send payment reminders to pending contributors

### Settlement Endpoints

#### GET /api/settlements
Get settlement history
```
Query Parameters:
- page: number
- limit: number
- status: string
- startDate: ISO date string
- endDate: ISO date string
```

#### GET /api/settlements/:id
Get settlement details

#### POST /api/settlements/request
Request manual settlement
```json
{
  "amount": 100000,
  "transactionIds": ["txn_id_1", "txn_id_2"]
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get dashboard analytics
```json
{
  "totalRevenue": 1500000,
  "totalTransactions": 156,
  "successRate": 98.5,
  "pendingAmount": 25000,
  "recentTransactions": [...],
  "monthlyStats": [...],
  "paymentMethods": [...]
}
```

#### GET /api/analytics/transactions
Get transaction analytics with date range

#### GET /api/analytics/revenue
Get revenue analytics

### QR Code Endpoints

#### GET /api/qr-codes
Get all QR codes

#### POST /api/qr-codes/generate
Generate new QR code
```json
{
  "name": "Restaurant Payment",
  "type": "pay_for_me",
  "amount": 50000,
  "description": "Payment for restaurant bill",
  "usageLimit": 100,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### PUT /api/qr-codes/:id
Update QR code

#### DELETE /api/qr-codes/:id
Deactivate QR code

### Settings Endpoints

#### GET /api/settings/profile
Get merchant profile

#### PUT /api/settings/profile
Update merchant profile

#### PUT /api/settings/business
Update business information

#### GET /api/settings/notifications
Get notification preferences

#### PUT /api/settings/notifications
Update notification preferences

#### POST /api/settings/change-password
Change password

#### POST /api/settings/generate-api-key
Generate new API key

### Webhook Endpoints

#### POST /api/webhooks/payment-status
Receive payment status updates from PSPs

#### POST /api/webhooks/settlement-status
Receive settlement status updates

## Real-time Features (WebSocket Events)

### Client Events
- `transaction:created` - New transaction created
- `transaction:updated` - Transaction status updated
- `settlement:processed` - Settlement completed
- `payment:received` - Payment received for group split

### Server Events
- `join:merchant` - Join merchant-specific room
- `transaction:status` - Broadcast transaction updates
- `notification:new` - Send real-time notifications

## Payment Integration Requirements

### PSP Integration Flow
1. **Transaction Creation**: Create transaction record in database
2. **Payment Gateway Call**: Initiate payment with PSP
3. **Webhook Handling**: Receive payment status updates
4. **Database Update**: Update transaction status
5. **Real-time Notification**: Notify frontend via WebSocket

### Supported Payment Methods
- Credit/Debit Cards (Visa, Mastercard, Verve)
- Bank Transfer
- USSD Codes
- Mobile Money (MTN, Airtel, Glo, 9mobile)
- Bank USSD

### Settlement Flow
- **T+0 Settlement**: Same-day settlement for eligible merchants
- **T+1 Settlement**: Next business day settlement (default)
- **Manual Settlement**: On-demand settlement requests

## File Upload Handling

### KYC Document Upload
- **Allowed Types**: PDF, JPG, PNG (max 5MB per file)
- **Storage**: Cloud storage (AWS S3, Cloudinary)
- **Security**: Virus scanning, file type validation
- **Processing**: Extract metadata, generate thumbnails

### Upload Endpoint
```javascript
// Multer configuration example
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'private',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `kyc/${req.user.merchantId}/${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

## Security Requirements

### Authentication & Authorization
- **JWT Tokens**: Access and refresh token strategy
- **Password Security**: bcrypt hashing (min 12 rounds)
- **Rate Limiting**: API rate limiting (100 requests/minute)
- **CORS**: Proper CORS configuration
- **Input Validation**: Comprehensive input sanitization

### API Security
```javascript
// Example middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(express.json({ limit: '10mb' })); // Body parsing limits
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### Data Encryption
- **PII Encryption**: Encrypt sensitive data at rest
- **API Keys**: Secure API key generation and storage
- **Database**: Connection encryption (SSL/TLS)

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/spleetpay
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=spleetpay-uploads
AWS_REGION=us-east-1

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_test_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxx
MONNIFY_API_KEY=your-monnify-key
MONNIFY_SECRET_KEY=your-monnify-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@spleetpay.com

# SMS Service
TERMII_API_KEY=your-termii-key

# App Settings
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Webhook URLs
PAYSTACK_WEBHOOK_SECRET=your-paystack-webhook-secret
FLUTTERWAVE_WEBHOOK_SECRET=your-flutterwave-webhook-secret
```

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- AWS Account (for file storage)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd spleetpay-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

### Database Migrations
```bash
# Create new migration
npm run migration:create -- --name create-users-table

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback
```

## Deployment Considerations

### Production Requirements
- **Server**: Minimum 2GB RAM, 2 CPU cores
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis cluster for high availability
- **Load Balancer**: Nginx or AWS ALB
- **Monitoring**: Application monitoring (DataDog, New Relic)
- **Logging**: Centralized logging (ELK stack)

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Check Redis connection
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## API Testing

### Example Test Data
```javascript
// Test merchant creation
const testMerchant = {
  email: "test@merchant.com",
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "Merchant",
  businessName: "Test Business Ltd"
};

// Test transaction creation
const testTransaction = {
  type: "group_split",
  amount: 50000,
  description: "Test group payment",
  customerName: "Test Customer",
  customerEmail: "customer@test.com",
  contributors: [
    {
      name: "Contributor 1",
      email: "contrib1@test.com",
      amount: 25000
    },
    {
      name: "Contributor 2", 
      email: "contrib2@test.com",
      amount: 25000
    }
  ]
};
```

### Postman Collection
Include a comprehensive Postman collection with:
- All API endpoints
- Authentication flows
- Sample requests and responses
- Environment variables for testing

## Error Handling

### Standard Error Responses
```javascript
// Error response format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "timestamp": "2025-01-09T12:00:00Z",
  "path": "/api/auth/register"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PAYMENT_GATEWAY_ERROR` - PSP integration error
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Monitoring & Logging

### Metrics to Track
- Request/response times
- Error rates
- Database query performance
- Payment gateway response times
- Active user sessions
- Transaction volumes

### Log Levels
- `ERROR` - Application errors, payment failures
- `WARN` - Deprecated API usage, high response times
- `INFO` - Transaction events, user actions
- `DEBUG` - Detailed request/response data (dev only)

This documentation provides the foundation for implementing a robust backend system for the SpleetPay merchant dashboard. The backend should prioritize security, scalability, and real-time capabilities to support the comprehensive payment solution requirements.