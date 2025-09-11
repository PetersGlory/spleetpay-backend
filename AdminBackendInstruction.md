# SpleetPay Admin Dashboard

A comprehensive administrative dashboard for SpleetPay - a payment platform supporting both "Pay-for-Me" and "Group Split" payment types. This dashboard provides complete oversight of the payment platform, handling everything from merchant onboarding and KYC verification to transaction monitoring, settlement management, and dispute resolution.

## 🚀 Features

### Core Modules
- **Dashboard Overview** - Real-time metrics and system health monitoring
- **User Management** - Customer account management and verification
- **Merchant Management** - Complete merchant lifecycle with KYC verification
- **Payment Monitoring** - Real-time transaction tracking and fraud detection
- **Group Split Manager** - Advanced group payment orchestration
- **Settlement & Reconciliation** - Automated settlement processing and reporting
- **Refunds & Disputes** - Comprehensive dispute resolution workflow
- **Analytics & Insights** - Advanced reporting and business intelligence
- **API Sandbox** - Developer tools and API management
- **Admin Settings** - System configuration and user management

### Administrative Features
- **Multi-level Authorization** - Super Admin, Admin, Moderator, Analyst roles
- **Role-based Access Control** - Granular permissions system
- **Audit Logging** - Complete activity tracking
- **Real-time Notifications** - System alerts and monitoring
- **Dark/Light Theme** - Customizable UI preferences

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Shadcn/UI** component library
- **Lucide React** for icons
- **Recharts** for data visualization
- **React Hook Form** for form management
- **Sonner** for notifications

### Required Backend Technologies
- **Node.js/Express** or **Python/FastAPI** or **PHP/Laravel**
- **PostgreSQL** or **MySQL** for primary database
- **Redis** for caching and sessions
- **MongoDB** (optional) for logs and analytics
- **WebSocket** support for real-time updates
- **JWT** for authentication
- **Rate limiting** and **API throttling**

## 📋 Backend API Requirements

### Authentication & Authorization

#### User Authentication
```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/me
```

**Admin User Model:**
```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "moderator" | "analyst";
  permissions: string[];
  department: string;
  lastLogin: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}
```

### User Management APIs

```http
GET /api/users                    # List all users with pagination
GET /api/users/:id                # Get user details
POST /api/users                   # Create new user
PUT /api/users/:id                # Update user
DELETE /api/users/:id             # Soft delete user
POST /api/users/:id/verify        # Verify user KYC
POST /api/users/:id/suspend       # Suspend user account
GET /api/users/:id/transactions   # Get user transaction history
```

**User Model:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  kycStatus: "pending" | "verified" | "rejected";
  kycDocuments: KYCDocument[];
  accountStatus: "active" | "suspended" | "closed";
  walletBalance: number;
  currency: string;
  createdAt: string;
  lastLogin: string;
}
```

### Merchant Management APIs

```http
GET /api/merchants                # List all merchants
GET /api/merchants/:id            # Get merchant details
POST /api/merchants               # Create new merchant
PUT /api/merchants/:id            # Update merchant
POST /api/merchants/:id/approve   # Approve merchant application
POST /api/merchants/:id/reject    # Reject merchant application
GET /api/merchants/:id/transactions # Merchant transactions
POST /api/merchants/:id/settlements # Trigger settlement
```

**Merchant Model:**
```typescript
interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: Address;
  taxId: string;
  bankAccount: BankAccount;
  kycStatus: "pending" | "verified" | "rejected";
  onboardingStatus: "draft" | "submitted" | "approved" | "active";
  documents: Document[];
  apiKeys: APIKey[];
  settlementSchedule: "daily" | "weekly" | "monthly";
  fees: MerchantFees;
  createdAt: string;
  approvedAt?: string;
}
```

### Payment Monitoring APIs

```http
GET /api/payments                 # List all payments
GET /api/payments/:id             # Get payment details
POST /api/payments/refund         # Process refund
GET /api/payments/stats           # Payment statistics
GET /api/payments/fraud-alerts    # Fraud detection alerts
POST /api/payments/:id/investigate # Flag for investigation
```

**Payment Model:**
```typescript
interface Payment {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  type: "pay_for_me" | "group_split";
  status: "pending" | "processing" | "successful" | "failed" | "cancelled";
  paymentMethod: string;
  pspResponse: any;
  userId: string;
  merchantId?: string;
  metadata: Record<string, any>;
  fraudScore?: number;
  fraudFlags?: string[];
  createdAt: string;
  completedAt?: string;
}
```

### Group Split APIs

```http
GET /api/group-splits              # List group splits
GET /api/group-splits/:id          # Get group split details
POST /api/group-splits             # Create group split
PUT /api/group-splits/:id          # Update group split
POST /api/group-splits/:id/remind  # Send payment reminders
GET /api/group-splits/:id/participants # Get participants
```

**Group Split Model:**
```typescript
interface GroupSplit {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  organizerId: string;
  participants: Participant[];
  status: "active" | "completed" | "cancelled";
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface Participant {
  userId: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  paidAt?: string;
}
```

### Settlement & Reconciliation APIs

```http
GET /api/settlements               # List settlements
GET /api/settlements/:id           # Get settlement details
POST /api/settlements/process      # Process pending settlements
GET /api/settlements/reconciliation # Reconciliation reports
POST /api/settlements/dispute      # Raise settlement dispute
```

**Settlement Model:**
```typescript
interface Settlement {
  id: string;
  merchantId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalAmount: number;
  feeAmount: number;
  netAmount: number;
  transactionCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  bankAccount: BankAccount;
  processedAt?: string;
  reference?: string;
}
```

### Refunds & Disputes APIs

```http
GET /api/refunds                  # List refunds
POST /api/refunds                 # Process refund
GET /api/disputes                 # List disputes
GET /api/disputes/:id             # Get dispute details
POST /api/disputes/:id/resolve    # Resolve dispute
POST /api/disputes/:id/escalate   # Escalate dispute
```

**Refund Model:**
```typescript
interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedBy: string;
  processedBy?: string;
  createdAt: string;
  processedAt?: string;
}
```

### Analytics APIs

```http
GET /api/analytics/dashboard      # Dashboard metrics
GET /api/analytics/transactions   # Transaction analytics
GET /api/analytics/revenue        # Revenue analytics
GET /api/analytics/users          # User analytics
GET /api/analytics/merchants      # Merchant analytics
POST /api/analytics/reports       # Generate custom reports
```

### API Sandbox Management

```http
GET /api/sandbox/keys             # List API keys
POST /api/sandbox/keys            # Generate API key
DELETE /api/sandbox/keys/:id      # Revoke API key
GET /api/sandbox/logs             # API call logs
GET /api/sandbox/webhooks         # Webhook configurations
POST /api/sandbox/webhooks        # Create webhook
PUT /api/sandbox/webhooks/:id     # Update webhook
POST /api/sandbox/test            # Test API endpoints
```

## 🗄️ Database Schema Requirements

### Core Tables

#### admin_users
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'analyst')),
  permissions TEXT[], -- Array of permission strings
  department VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  date_of_birth DATE,
  address JSONB,
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
  wallet_balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'NGN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

#### merchants
```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  business_address JSONB,
  tax_id VARCHAR(50),
  bank_account JSONB,
  kyc_status VARCHAR(20) DEFAULT 'pending',
  onboarding_status VARCHAR(20) DEFAULT 'draft',
  settlement_schedule VARCHAR(20) DEFAULT 'daily',
  fees JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP
);
```

#### payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  type VARCHAR(20) NOT NULL CHECK (type IN ('pay_for_me', 'group_split')),
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  user_id UUID REFERENCES users(id),
  merchant_id UUID REFERENCES merchants(id),
  psp_response JSONB,
  metadata JSONB,
  fraud_score DECIMAL(3,2),
  fraud_flags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

#### group_splits
```sql
CREATE TABLE group_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  organizer_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE group_split_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_split_id UUID REFERENCES group_splits(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP
);
```

#### settlements
```sql
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  fee_amount DECIMAL(15,2) NOT NULL,
  net_amount DECIMAL(15,2) NOT NULL,
  transaction_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  bank_account JSONB,
  reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/spleetpay_admin
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# API Configuration
API_VERSION=v1
API_BASE_URL=https://api.spleetpay.ng
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Payment Service Provider (PSP) Configuration
PSP_BASE_URL=https://api.psp.com
PSP_SECRET_KEY=your-psp-secret-key
PSP_PUBLIC_KEY=your-psp-public-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_S3_BUCKET=spleetpay-documents
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_TIMEOUT=30s

# Development
NODE_ENV=development
PORT=3001
```

## 🚀 Setup Instructions

### 1. Backend Setup

#### Option A: Node.js/Express
```bash
# Initialize project
npm init -y
npm install express cors helmet morgan compression
npm install jsonwebtoken bcryptjs joi express-rate-limit
npm install pg redis ioredis
npm install nodemailer aws-sdk
npm install --save-dev nodemon typescript @types/node

# Database setup
npm install prisma @prisma/client
npx prisma init
npx prisma generate
npx prisma migrate dev
```

#### Option B: Python/FastAPI
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary
pip install redis python-jose bcrypt python-multipart
pip install pydantic-settings alembic
pip install boto3 sendgrid

# Database setup
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 2. Database Setup

```sql
-- Create database
CREATE DATABASE spleetpay_admin;
CREATE USER spleetpay_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE spleetpay_admin TO spleetpay_user;

-- Run migrations
-- Import provided schema or run migration files
```

### 3. Frontend Setup

```bash
# Install dependencies (already configured in the project)
npm install

# Start development server
npm run dev
```

## 📡 Real-time Features

### WebSocket Events

The dashboard requires real-time updates for:

```typescript
// WebSocket event types
interface WebSocketEvents {
  'payment:created': Payment;
  'payment:updated': Payment;
  'settlement:completed': Settlement;
  'dispute:created': Dispute;
  'user:login': { userId: string; timestamp: string };
  'merchant:approved': Merchant;
  'system:alert': SystemAlert;
}
```

### Required WebSocket Implementation

```javascript
// Backend WebSocket setup example
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Admin authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT and admin permissions
  next();
});

// Real-time payment updates
paymentService.on('payment:created', (payment) => {
  io.to('admin-room').emit('payment:created', payment);
});
```

## 🔐 Security Requirements

### 1. Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) for super admins
- Session management with Redis

### 2. API Security
- Rate limiting (100 requests per 15 minutes per IP)
- Request validation and sanitization
- CORS configuration
- Helmet.js for security headers
- API key authentication for external services

### 3. Data Protection
- Encryption at rest for sensitive data
- PCI DSS compliance for payment data
- GDPR compliance for user data
- Audit logging for all admin actions

### 4. Infrastructure Security
- HTTPS/TLS encryption
- Environment variable management
- Database connection security
- File upload validation and scanning

## 📊 Monitoring & Logging

### Required Logging
```typescript
interface AuditLog {
  id: string;
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
```

### Metrics to Track
- API response times
- Error rates
- Payment success rates
- User activity patterns
- System resource usage
- Security events

## 🚦 API Rate Limiting

```typescript
// Rate limiting configuration
const rateLimits = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  api: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
  fileUpload: { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
  reports: { windowMs: 60 * 60 * 1000, max: 50 } // 50 reports per hour
};
```

## 🔄 Webhook System

### Outgoing Webhooks
```typescript
interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  signature: string;
}

// Supported events
const webhookEvents = [
  'payment.success',
  'payment.failed',
  'refund.processed',
  'dispute.created',
  'settlement.completed',
  'user.verified',
  'merchant.approved'
];
```

## 🧪 Testing Requirements

### API Testing
- Unit tests for all endpoints
- Integration tests for payment flows
- Load testing for critical paths
- Security testing for vulnerabilities

### Frontend Testing
- Component testing with React Testing Library
- E2E testing with Playwright or Cypress
- Accessibility testing
- Cross-browser compatibility testing

## 🚀 Deployment

### Production Deployment Checklist

#### Backend
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cache configured
- [ ] File storage (S3) configured
- [ ] SSL certificates installed
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented
- [ ] Load balancer configured

#### Frontend
- [ ] Build optimized for production
- [ ] CDN configured for static assets
- [ ] Environment-specific API URLs
- [ ] Error tracking configured
- [ ] Performance monitoring enabled

### Docker Configuration

```dockerfile
# Backend Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: spleetpay_admin
      POSTGRES_USER: spleetpay_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 📚 API Documentation

### Documentation Requirements
- OpenAPI/Swagger specification
- Interactive API documentation
- Code examples in multiple languages
- Webhook documentation
- Error code reference
- Rate limiting documentation

### Sample OpenAPI Spec Structure
```yaml
openapi: 3.0.0
info:
  title: SpleetPay Admin API
  version: 1.0.0
  description: Admin dashboard API for SpleetPay payment platform

servers:
  - url: https://api.spleetpay.ng/admin/v1
    description: Production server
  - url: https://sandbox-api.spleetpay.ng/admin/v1
    description: Sandbox server

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Implement comprehensive error handling
3. Write unit tests for all new features
4. Follow RESTful API design principles
5. Maintain backward compatibility
6. Document all API changes

### Code Review Process
1. All code must be reviewed before merging
2. Automated tests must pass
3. Security review for sensitive changes
4. Performance impact assessment
5. Documentation updates required

## 📞 Support

For technical support and questions:
- **Development Team**: dev@spleetpay.ng
- **DevOps/Infrastructure**: devops@spleetpay.ng
- **Security Issues**: security@spleetpay.ng
- **Documentation**: docs@spleetpay.ng

## 📄 License

This project is proprietary software. All rights reserved by SpleetPay Ltd.

---

**Note**: This README serves as a comprehensive guide for backend developers to implement the required APIs and infrastructure for the SpleetPay Admin Dashboard. Ensure all security measures and compliance requirements are met before deploying to production.