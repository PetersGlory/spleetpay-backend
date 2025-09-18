
require('dotenv').config();

const http = require('http');
const app = require('./app');
const { sequelize, syncDatabase } = require('./models');
const webSocketService = require('./services/websocket.service');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service
webSocketService.initialize(server);

server.listen(PORT, async () => {
  console.log(`🚀 SpleetPay Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync database models
    await syncDatabase();
    console.log('✅ Database models synchronized');
    
    console.log('\n🎉 SpleetPay Backend is ready to accept requests!');
    console.log('\n📋 Available Features:');
    console.log('   • User Authentication & Authorization');
    console.log('   • Merchant Onboarding & KYC');
    console.log('   • Payment Processing (Paystack Integration)');
    console.log('   • Group Split Payments');
    console.log('   • QR Code Generation');
    console.log('   • Real-time WebSocket Updates');
    console.log('   • Analytics & Reporting');
    console.log('   • Admin Dashboard APIs');
    console.log('   • Webhook Handling');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    sequelize.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    sequelize.close();
    process.exit(0);
  });
}); 