
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics API endpoints
 */

// Merchant analytics
/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get merchant dashboard analytics
 *     description: Retrieve analytics data for the merchant dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', auth, analyticsController.getMerchantDashboard);

/**
 * @swagger
 * /analytics/transactions:
 *   get:
 *     tags: [Analytics]
 *     summary: Get transaction analytics
 *     description: Retrieve analytics data for transactions.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', auth, analyticsController.getTransactionAnalytics);

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     tags: [Analytics]
 *     summary: Get revenue analytics
 *     description: Retrieve analytics data for revenue.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/revenue', auth, analyticsController.getRevenueAnalytics);

// Admin analytics
/**
 * @swagger
 * /admin/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get admin dashboard analytics
 *     description: Retrieve analytics data for the admin dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/dashboard', adminAuth, analyticsController.getAdminDashboard);

/**
 * @swagger
 * /admin/analytics/transactions:
 *   get:
 *     tags: [Analytics]
 *     summary: Get admin transaction analytics
 *     description: Retrieve analytics data for admin transactions.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/transactions', adminAuth, analyticsController.getTransactionAnalytics);

/**
 * @swagger
 * /admin/analytics/revenue:
 *   get:
 *     tags: [Analytics]
 *     summary: Get admin revenue analytics
 *     description: Retrieve analytics data for admin revenue.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/revenue', adminAuth, analyticsController.getRevenueAnalytics);

/**
 * @swagger
 * /analytics/reports:
 *   post:
 *     tags: [Analytics]
 *     summary: Generate analytics report
 *     description: Generate a custom analytics report.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add report parameters here
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/reports', auth, analyticsController.generateReport);

module.exports = router;