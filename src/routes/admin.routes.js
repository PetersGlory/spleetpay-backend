const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const transactionController = require('../controllers/transaction.controller');
const merchantController = require('../controllers/merchant.controller');
const userController = require('../controllers/user.controller');
const { adminAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { api: rateLimit } = require('../middleware/rateLimiter');

// Apply rate limiting to all admin routes
router.use(rateLimit);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: SpleetPay Admin API endpoints
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard analytics
 *     description: Retrieve comprehensive analytics for the admin dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                         totalMerchants:
 *                           type: integer
 *                         activeMerchants:
 *                           type: integer
 *                         totalTransactions:
 *                           type: integer
 *                         completedTransactions:
 *                           type: integer
 *                         totalRevenue:
 *                           type: number
 *                         totalFees:
 *                           type: number
 *                         pendingSettlements:
 *                           type: integer
 *                         successRate:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', adminAuth, analyticsController.getAdminDashboard);

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: Get all transactions
 *     description: Retrieve all transactions with admin-level access and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, partial, completed, failed, cancelled]
 *         description: Filter by transaction status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pay_for_me, group_split]
 *         description: Filter by transaction type
 *       - in: query
 *         name: merchantId
 *         schema:
 *           type: string
 *         description: Filter by merchant ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter transactions until this date
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/transactions', adminAuth, transactionController.getTransactions);

/**
 * @swagger
 * /admin/transactions/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction by ID with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Transaction not found
 */
router.get('/transactions/:id', adminAuth, validate(schemas.uuidParam, 'params'), transactionController.getTransaction);

/**
 * @swagger
 * /admin/merchants:
 *   get:
 *     tags: [Admin]
 *     summary: Get all merchants
 *     description: Retrieve all merchants with admin-level access and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: kycStatus
 *         schema:
 *           type: string
 *           enum: [pending, submitted, approved, rejected]
 *         description: Filter by KYC status
 *       - in: query
 *         name: onboardingStatus
 *         schema:
 *           type: string
 *           enum: [draft, submitted, approved, active]
 *         description: Filter by onboarding status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by business name or email
 *     responses:
 *       200:
 *         description: Merchants retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/merchants', adminAuth, merchantController.getAllMerchants);

/**
 * @swagger
 * /admin/merchants/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Approve or reject merchant
 *     description: Approve or reject a merchant's KYC and onboarding application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: Whether to approve or reject the merchant
 *     responses:
 *       200:
 *         description: Merchant approval status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Merchant not found
 */
router.put('/merchants/:id/approve', adminAuth, validate(schemas.uuidParam, 'params'), merchantController.approveMerchant);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     description: Retrieve all users with admin-level access and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: accountStatus
 *         schema:
 *           type: string
 *           enum: [active, suspended, closed]
 *         description: Filter by account status
 *       - in: query
 *         name: kycStatus
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         description: Filter by KYC status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', adminAuth, userController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *   put:
 *     tags: [Admin]
 *     summary: Update user
 *     description: Update user details with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               accountStatus:
 *                 type: string
 *                 enum: [active, suspended, closed]
 *               kycStatus:
 *                 type: string
 *                 enum: [pending, verified, rejected]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user
 *     description: Soft delete a user account with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.get('/users/:id', adminAuth, validate(schemas.uuidParam, 'params'), userController.getUserById);
router.put('/users/:id', adminAuth, validate(schemas.uuidParam, 'params'), userController.updateUser);
router.delete('/users/:id', adminAuth, validate(schemas.uuidParam, 'params'), userController.deleteUser);

module.exports = router; 