require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const utilsRoutes = require('./routes/utils.routes');
const transactionRoutes = require('./routes/transaction.routes');
const merchantRoutes = require('./routes/merchant.routes');
const qrCodeRoutes = require('./routes/qrCode.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const webhookRoutes = require('./routes/webhook.routes');
const errorHandler = require('./middleware/errorHandler');
const setupSwagger = require('./swagger');

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "*", 
  credentials: true 
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// default page
app.get("/", (req, res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/utils', utilsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Register Swagger docs
setupSwagger(app);

// Error handling middleware
app.use(errorHandler);

module.exports = app;