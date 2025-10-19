const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const transactionController = require('../controllers/transaction.controller');
const merchantController = require('../controllers/merchant.controller');
const userController = require('../controllers/user.controller');
const paymentRateController = require('../controllers/paymentRate.controller');
const walletController = require('../controllers/wallet.controller');
const qrCodeController = require('../controllers/qrCode.controller');
const paymentRequestController = require('../controllers/paymentRequest.controller');
const adminSettingsRoutes = require('./adminSettings.routes');
const { adminAuth } = require('../middleware/auth');

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
router.get('/transactions/:id', adminAuth,transactionController.getTransaction);

/**
 * @swagger
 * /admin/group-payments:
 *   get:
 *     tags: [Admin]
 *     summary: Get all group payments
 *     description: Retrieve all group split payments with admin-level access and filtering
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
 *           enum: [pending, partially_paid, completed, expired]
 *         description: Filter by payment status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments until this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by payment description
 *     responses:
 *       200:
 *         description: Group payments retrieved successfully
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
 *                     groupPayments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           type:
 *                             type: string
 *                             enum: [group_split]
 *                           description:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           currency:
 *                             type: string
 *                           status:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           splitType:
 *                             type: string
 *                           totalCollected:
 *                             type: number
 *                           paidParticipants:
 *                             type: integer
 *                           totalParticipants:
 *                             type: integer
 *                           completionPercentage:
 *                             type: number
 *                           participants:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 amount:
 *                                   type: number
 *                                 hasPaid:
 *                                   type: boolean
 *                                 paidAmount:
 *                                   type: number
 *                                 paidAt:
 *                                   type: string
 *                                   format: date-time
 *                                 paymentMethod:
 *                                   type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/group-payments', adminAuth, paymentRequestController.getAllGroupPayments);

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
router.put('/merchants/:id/approve', adminAuth, merchantController.approveMerchant);

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
 *               phone:
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
router.get('/users/:id', adminAuth, userController.getUserById);
router.put('/users/:id', adminAuth, userController.updateUser);
router.delete('/users/:id', adminAuth, userController.deleteUser);

/**
 * @swagger
 * /admin/transactions/{id}/cancel:
 *   put:
 *     tags: [Admin]
 *     summary: Cancel transaction
 *     description: Cancel a pending transaction with admin-level access
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
 *         description: Transaction cancelled successfully
 *       400:
 *         description: Bad request - Transaction cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Transaction not found
 */
router.put('/transactions/:id/cancel', adminAuth, transactionController.cancelTransaction);

/**
 * @swagger
 * /admin/transactions/{id}/reminders:
 *   post:
 *     tags: [Admin]
 *     summary: Send payment reminders
 *     description: Send payment reminders for group split transactions with admin-level access
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
 *         description: Reminders sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Transaction not found
 */
router.post('/transactions/:id/reminders', adminAuth, transactionController.sendReminders);

/**
 * @swagger
 * /admin/merchants/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get merchant by ID
 *     description: Retrieve a specific merchant by ID with admin-level access
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
 *     responses:
 *       200:
 *         description: Merchant retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Merchant not found
 *   put:
 *     tags: [Admin]
 *     summary: Update merchant
 *     description: Update merchant details with admin-level access
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
 *             properties:
 *               businessName:
 *                 type: string
 *               businessEmail:
 *                 type: string
 *               businessPhone:
 *                 type: string
 *               businessAddress:
 *                 type: string
 *               businessType:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *               kycStatus:
 *                 type: string
 *                 enum: [pending, submitted, approved, rejected]
 *               onboardingStatus:
 *                 type: string
 *                 enum: [draft, submitted, approved, active]
 *     responses:
 *       200:
 *         description: Merchant updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Merchant not found
 */
router.get('/merchants/:id', adminAuth, merchantController.getMerchantProfile);
router.put('/merchants/:id', adminAuth, merchantController.updateMerchantProfile);

/**
 * @swagger
 * /admin/payment-rates:
 *   get:
 *     tags: [Admin]
 *     summary: Get all payment rates
 *     description: Retrieve all payment rates with admin-level access
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment rates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *   post:
 *     tags: [Admin]
 *     summary: Create payment rate
 *     description: Create a new payment rate with admin-level access
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ratePercentage
 *               - slugType
 *             properties:
 *               title:
 *                 type: string
 *                 description: Payment rate title
 *               ratePercentage:
 *                 type: number
 *                 description: Rate percentage
 *               slugType:
 *                 type: string
 *                 description: Slug type for the rate
 *     responses:
 *       201:
 *         description: Payment rate created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/payment-rates', adminAuth, paymentRateController.getAllPaymentRates);
router.post('/payment-rates', adminAuth, paymentRateController.createPaymentRate);

/**
 * @swagger
 * /admin/payment-rates/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get payment rate by ID
 *     description: Retrieve a specific payment rate by ID with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment rate ID
 *     responses:
 *       200:
 *         description: Payment rate retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment rate not found
 *   put:
 *     tags: [Admin]
 *     summary: Update payment rate
 *     description: Update a payment rate with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment rate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               ratePercentage:
 *                 type: number
 *               slugType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment rate updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment rate not found
 *   delete:
 *     tags: [Admin]
 *     summary: Delete payment rate
 *     description: Delete a payment rate with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment rate ID
 *     responses:
 *       200:
 *         description: Payment rate deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment rate not found
 */
router.get('/payment-rates/:id', adminAuth, paymentRateController.getPaymentRate);
router.put('/payment-rates/:id', adminAuth, paymentRateController.updatePaymentRate);
router.delete('/payment-rates/:id', adminAuth, paymentRateController.deletePaymentRate);

/**
 * @swagger
 * /admin/wallets:
 *   get:
 *     tags: [Admin]
 *     summary: Get all user wallets
 *     description: Retrieve all user wallets with admin-level access and filtering
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
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Filter by currency
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/wallets', adminAuth, walletController.getAllWallets);

/**
 * @swagger
 * /admin/wallets/{userId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user wallet by user ID
 *     description: Retrieve a specific user's wallet with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Wallet not found
 *   put:
 *     tags: [Admin]
 *     summary: Update user wallet balance
 *     description: Update a user's wallet balance with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *             required:
 *               - balance
 *             properties:
 *               balance:
 *                 type: number
 *                 description: New wallet balance
 *               reason:
 *                 type: string
 *                 description: Reason for balance update
 *     responses:
 *       200:
 *         description: Wallet balance updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Wallet not found
 */
router.get('/wallets/:userId', adminAuth, walletController.getWalletBalance);
router.put('/wallets/:userId', adminAuth, walletController.updateWalletBalance);

/**
 * @swagger
 * /admin/wallets/{userId}/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: Get user wallet transactions
 *     description: Retrieve wallet transaction history for a specific user with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit, debit]
 *         description: Filter by transaction type
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
 *         description: Wallet transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.get('/wallets/:userId/transactions', adminAuth, walletController.getWalletTransactions);

/**
 * @swagger
 * /admin/qr-codes:
 *   get:
 *     tags: [Admin]
 *     summary: Get all QR codes
 *     description: Retrieve all QR codes with admin-level access and filtering
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
 *         name: merchantId
 *         schema:
 *           type: string
 *         description: Filter by merchant ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pay_for_me, group_split]
 *         description: Filter by QR code type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: QR codes retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/qr-codes', adminAuth, qrCodeController.getAllQRCodes);

/**
 * @swagger
 * /admin/qr-codes/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get QR code by ID
 *     description: Retrieve a specific QR code by ID with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: QR code not found
 *   put:
 *     tags: [Admin]
 *     summary: Update QR code
 *     description: Update a QR code with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               usageLimit:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: QR code updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: QR code not found
 *   delete:
 *     tags: [Admin]
 *     summary: Deactivate QR code
 *     description: Deactivate a QR code with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: QR code ID
 *     responses:
 *       200:
 *         description: QR code deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: QR code not found
 */
router.get('/qr-codes/:id', adminAuth, qrCodeController.getQRCode);
router.put('/qr-codes/:id', adminAuth, qrCodeController.updateQRCode);
router.delete('/qr-codes/:id', adminAuth, qrCodeController.deactivateQRCode);

/**
 * @swagger
 * /admin/analytics/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: Get transaction analytics
 *     description: Retrieve transaction analytics with admin-level access
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
 *     responses:
 *       200:
 *         description: Transaction analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/transactions', adminAuth, analyticsController.getTransactionAnalytics);

/**
 * @swagger
 * /admin/analytics/revenue:
 *   get:
 *     tags: [Admin]
 *     summary: Get revenue analytics
 *     description: Retrieve revenue analytics with admin-level access
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Filter revenue from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter revenue until this date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: day
 *         description: Group revenue data by time period
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/revenue', adminAuth, analyticsController.getRevenueAnalytics);

/**
 * @swagger
 * /admin/analytics/reports:
 *   post:
 *     tags: [Admin]
 *     summary: Generate custom analytics report
 *     description: Generate a custom analytics report with admin-level access
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [transactions, revenue, merchant_dashboard, admin_dashboard]
 *                 description: Type of report to generate
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date for the report
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date for the report
 *               merchantId:
 *                 type: string
 *                 description: Filter by merchant ID (optional)
 *               format:
 *                 type: string
 *                 enum: [json, pdf, excel]
 *                 default: json
 *                 description: Report format
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       400:
 *         description: Bad request - Invalid report type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/analytics/reports', adminAuth, analyticsController.generateReport);

// Admin Settings Routes
router.use('/settings', adminSettingsRoutes);

module.exports = router; 