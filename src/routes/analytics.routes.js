const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { auth, adminAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { reports: rateLimit } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(rateLimit);

// Merchant analytics
router.get('/dashboard', auth, analyticsController.getMerchantDashboard);
router.get('/transactions', auth, validate(schemas.dateRange, 'query'), analyticsController.getTransactionAnalytics);
router.get('/revenue', auth, validate(schemas.dateRange, 'query'), analyticsController.getRevenueAnalytics);

// Admin analytics
router.get('/admin/dashboard', adminAuth, analyticsController.getAdminDashboard);
router.get('/admin/transactions', adminAuth, validate(schemas.dateRange, 'query'), analyticsController.getTransactionAnalytics);
router.get('/admin/revenue', adminAuth, validate(schemas.dateRange, 'query'), analyticsController.getRevenueAnalytics);

// Custom reports
router.post('/reports', auth, analyticsController.generateReport);

module.exports = router;
