# SpleetPay Backend

A comprehensive payment platform backend supporting "Pay-for-Me" and "Group Split" payment types with Paystack integration.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Email verification
  - Password reset functionality
  - Role-based access control (Admin/User)

- **Merchant Onboarding & Management**
  - Merchant registration and KYC process
  - Document upload for verification
  - API key generation for approved merchants
  - Settlement account management

- **Payment Processing**
  - Paystack integration for payment processing
  - Support for "Pay-for-Me" transactions
  - Group split payment functionality
  - Real-time payment status updates
  - Webhook handling for payment events

- **QR Code Generation**
  - Dynamic QR codes for payment requests
  - Support for both payment types
  - Usage tracking and limits
  - Expiration management

- **Analytics & Reporting**
  - Transaction analytics
  - Revenue reporting
  - Merchant performance metrics
  - Admin dashboard analytics

- **Real-time Features**
  - WebSocket support for live updates
  - Payment notifications
  - Transaction status updates
  - System alerts

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with refresh tokens
- **Payment Gateway**: Paystack
- **Real-time**: Socket.io
- **File Upload**: AWS S3 with Multer
- **Email**: Nodemailer with SMTP
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, rate limiting
- **Documentation**: Swagger/OpenAPI

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spleetpay-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:3001

   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/spleetpay
   DB_DIALECT=postgresql
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=spleetpay
   DB_USER=username
   DB_PASSWORD=password

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Paystack Configuration
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
   PAYSTACK_BASE_URL=https://api.paystack.co
   PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret_here

   # Email Configuration (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@spleetpay.ng
   FROM_NAME=SpleetPay

   # AWS S3 Configuration (for file uploads)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=spleetpay-uploads

   # Redis Configuration (for caching and sessions)
   REDIS_URL=redis://localhost:6379
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # Security
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your-session-secret-here
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run migrate
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

Once the server is running, you can access the API documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/verify/:token` - Email verification
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/transactions` - Get user transactions
- `GET /api/users/wallet` - Get user wallet
- `DELETE /api/users/account` - Delete account

### Transactions
- `POST /api/transactions/create` - Create transaction
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions/:id/initialize` - Initialize payment
- `GET /api/transactions/verify/:reference` - Verify payment
- `POST /api/transactions/:id/reminders` - Send reminders
- `PUT /api/transactions/:id/cancel` - Cancel transaction

### Merchants
- `POST /api/merchants/register` - Register merchant
- `GET /api/merchants/profile` - Get merchant profile
- `PUT /api/merchants/profile` - Update merchant profile
- `POST /api/merchants/kyc/submit` - Submit KYC
- `POST /api/merchants/kyc/upload` - Upload KYC document
- `POST /api/merchants/api-key/generate` - Generate API key
- `GET /api/merchants/stats` - Get merchant statistics

### QR Codes
- `POST /api/qr-codes/generate` - Generate QR code
- `GET /api/qr-codes` - Get QR codes
- `GET /api/qr-codes/:id` - Get QR code by ID
- `PUT /api/qr-codes/:id` - Update QR code
- `DELETE /api/qr-codes/:id` - Deactivate QR code
- `GET /api/qr-codes/stats/overview` - Get QR code statistics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/transactions` - Get transaction analytics
- `GET /api/analytics/revenue` - Get revenue analytics
- `POST /api/analytics/reports` - Generate custom report

### Webhooks
- `POST /api/webhooks/paystack` - Paystack webhooks
- `POST /api/webhooks/settlement` - Settlement webhooks
- `POST /api/webhooks/group-split` - Group split notifications

## Database Schema

### Core Models
- **Users**: User accounts and profiles
- **AdminUsers**: Admin user accounts
- **Merchants**: Merchant accounts and business information
- **Transactions**: Payment transactions
- **GroupSplitContributors**: Contributors for group split payments
- **Settlements**: Settlement records
- **Refunds**: Refund transactions
- **Disputes**: Dispute records
- **KYCDocuments**: KYC document uploads
- **Directors**: Merchant directors information
- **QRCodes**: QR code records
- **Wallets**: User wallets

## WebSocket Events

### Client Events
- `ping` - Health check
- `join-room` - Join a specific room
- `leave-room` - Leave a room

### Server Events
- `transaction:created` - New transaction created
- `transaction:updated` - Transaction status updated
- `payment:received` - Payment received notification
- `settlement:updated` - Settlement status updated
- `dispute:created` - New dispute created
- `system:alert` - System alert
- `notification:new` - New notification

## Security Features

- **Rate Limiting**: Different limits for different endpoints
- **Input Validation**: Joi schema validation
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Security Headers**: Helmet.js for security headers
- **Password Security**: bcryptjs with configurable rounds
- **CORS**: Configurable CORS settings
- **Request Size Limits**: Configurable request size limits

## Development

### Scripts
```bash
npm run dev          # Start development server
npm start            # Start production server
npm run migrate      # Run database migrations
npm run migrate:rollback  # Rollback migrations
npm run seed         # Seed database
npm test             # Run tests
```

### Database Migrations
```bash
# Create a new migration
npm run migration:create -- --name create-users-table

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@spleetpay.ng or create an issue in the repository.
