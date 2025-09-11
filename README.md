# SpleetPay Backend API

A comprehensive backend API for SpleetPay - a payment platform supporting both "Pay-for-Me" and "Group Split" payment types. This backend provides APIs for both Admin Dashboard and Merchant Dashboard applications.

## 🚀 Features

### Core Modules
- **Authentication & Authorization** - JWT-based auth with role-based access control
- **User Management** - Customer account management and verification
- **Merchant Management** - Complete merchant lifecycle with KYC verification
- **Payment Processing** - Real-time transaction handling for both payment types
- **Group Split Management** - Advanced group payment orchestration
- **Settlement & Reconciliation** - Automated settlement processing
- **Analytics & Reporting** - Comprehensive business intelligence
- **Real-time Updates** - WebSocket support for live data
- **Admin Dashboard APIs** - Complete administrative oversight
- **Merchant Dashboard APIs** - Merchant-focused functionality

### Payment Types Supported
1. **Pay-for-Me** - One person pays for others and can request reimbursement
2. **Group Split** - Bills divided equally or unequally among multiple contributors

## 🛠 Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **Prisma** ORM with PostgreSQL
- **Redis** for caching and sessions
- **Socket.io** for real-time updates
- **JWT** for authentication
- **Bcrypt** for password hashing

### External Integrations
- **Payment Service Providers (PSPs)** - Paystack, Flutterwave, Monnify
- **File Storage** - AWS S3 for document uploads
- **Email Service** - SMTP/SendGrid for notifications
- **SMS Service** - Termii for SMS notifications

## 📋 API Structure

### Admin APIs (`/api/v1/admin/`)
- **Authentication**: Admin login, token refresh
- **User Management**: List, view, update, suspend users
- **Merchant Management**: Approve, reject, manage merchant applications
- **Transaction Monitoring**: View all transactions, fraud detection
- **Settlement Management**: Process settlements, reconciliation
- **Analytics**: Dashboard metrics, reports, insights
- **System Configuration**: Admin settings, permissions
- **Audit Logs**: Complete activity tracking

### Merchant APIs (`/api/v1/`)
- **Authentication**: Merchant login, registration, password reset
- **KYC Management**: Document upload, status tracking
- **Transaction Management**: Create, view, manage transactions
- **Group Split**: Create group payments, manage contributors
- **Settlement**: View settlement history, request manual settlements
- **QR Codes**: Generate and manage payment QR codes
- **Analytics**: Merchant dashboard metrics
- **Settings**: Profile, business info, notifications

## 🗄️ Database Schema

### Core Tables
- **admin_users** - Administrative users with role-based permissions
- **users** - Regular users (merchants and customers)
- **merchants** - Business information and KYC status
- **kyc_documents** - Document storage and verification
- **directors** - Business directors information
- **transactions** - Payment transactions
- **group_split_contributors** - Group payment participants
- **settlements** - Settlement records and processing
- **qr_codes** - Generated QR codes for payments
- **admin_logs** - Audit trail for admin actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spleetpay-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up postgres redis -d
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database
   npm run prisma:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/spleetpay_admin
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# API Configuration
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Payment Gateways
PSP_SECRET_KEY=your-psp-secret-key
PSP_PUBLIC_KEY=your-psp-public-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=spleetpay-documents

# Email & SMS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
TERMII_API_KEY=your-termii-key
```

## 📡 API Endpoints

### Authentication
```http
POST /api/v1/admin/login          # Admin login
POST /api/v1/merchant/login       # Merchant login
POST /api/v1/merchant/register    # Merchant registration
POST /api/v1/refresh              # Token refresh
POST /api/v1/logout               # Logout
GET  /api/v1/me                   # Get current user
```

### Admin Endpoints
```http
GET  /api/v1/admin/users                    # List users
GET  /api/v1/admin/merchants                # List merchants
GET  /api/v1/admin/transactions             # List transactions
GET  /api/v1/admin/settlements              # List settlements
GET  /api/v1/admin/analytics/dashboard      # Dashboard metrics
POST /api/v1/admin/merchants/:id/approve    # Approve merchant
```

### Merchant Endpoints
```http
GET  /api/v1/transactions                   # List transactions
POST /api/v1/transactions/create            # Create transaction
GET  /api/v1/group-splits                   # List group splits
POST /api/v1/group-splits/:id/remind        # Send reminders
GET  /api/v1/settlements                    # Settlement history
POST /api/v1/qr-codes/generate              # Generate QR code
```

## 🧪 Testing

### Test Credentials (After Seeding)

**Admin Users:**
- Super Admin: `superadmin@spleetpay.com` / `Admin123!`
- Admin: `admin@spleetpay.com` / `Admin123!`
- Moderator: `moderator@spleetpay.com` / `Moderator123!`
- Analyst: `analyst@spleetpay.com` / `Analyst123!`

**Merchant User:**
- Merchant: `merchant@example.com` / `Merchant123!`

### API Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control (RBAC)**
- **Rate Limiting** (100 requests per 15 minutes)
- **Input Validation** and sanitization
- **Password Hashing** with bcrypt (12 rounds)
- **CORS Protection**
- **Security Headers** with Helmet.js
- **Audit Logging** for all admin actions

## 📊 Real-time Features

### WebSocket Events
- `payment:created` - New payment received
- `payment:updated` - Payment status changed
- `settlement:completed` - Settlement processed
- `user:login` - User login notifications
- `merchant:approved` - Merchant approval notifications
- `system:alert` - System alerts and warnings

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cache configured
- [ ] SSL certificates installed
- [ ] Monitoring tools configured
- [ ] Backup strategy implemented

### Docker Production Build
```bash
# Build production image
docker build -t spleetpay-backend .

# Run with production environment
docker run -d \
  --name spleetpay-backend \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your-production-db-url \
  spleetpay-backend
```

## 📚 Documentation

### API Documentation
- Interactive API docs available at `/api/v1/docs` (when implemented)
- Postman collection included in `/docs` folder
- OpenAPI specification in `/docs/openapi.yaml`

### Database Schema
- Prisma schema: `prisma/schema.prisma`
- Migration files: `prisma/migrations/`
- Seed data: `prisma/seed.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
1. Follow TypeScript best practices
2. Write comprehensive tests
3. Update documentation
4. Follow RESTful API design
5. Maintain backward compatibility

## 📞 Support

For technical support and questions:
- **Development Team**: dev@spleetpay.ng
- **DevOps/Infrastructure**: devops@spleetpay.ng
- **Security Issues**: security@spleetpay.ng

## 📄 License

This project is proprietary software. All rights reserved by SpleetPay Ltd.

---

**Note**: This README serves as a comprehensive guide for developers working with the SpleetPay Backend API. Ensure all security measures and compliance requirements are met before deploying to production.