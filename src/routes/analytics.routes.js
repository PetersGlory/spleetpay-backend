const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { auth, adminAuth } = require('../middleware/auth');

// Merchant analytics
router.get('/dashboard', auth, analyticsController.getMerchantDashboard);
router.get('/transactions', auth, analyticsController.getTransactionAnalytics);
router.get('/revenue', auth, analyticsController.getRevenueAnalytics);

// Admin analytics
router.get('/admin/dashboard', adminAuth, analyticsController.getAdminDashboard);
router.get('/admin/transactions', adminAuth, analyticsController.getTransactionAnalytics);
router.get('/admin/revenue', adminAuth, analyticsController.getRevenueAnalytics);

// Custom reports
router.post('/reports', auth, analyticsController.generateReport);

module.exports = router;
