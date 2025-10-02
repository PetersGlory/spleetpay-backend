
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const paymentRequestController = require('../controllers/paymentRequest.controller');
const walletController = require('../controllers/wallet.controller');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User-related operations
 */



// Payment Request Routes
/**
 * @swagger
 * /users/payments/create:
 *   post:
 *     tags: [User]
 *     summary: Create payment request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *     responses:
 *       201:
 *         description: Payment request created successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/payments/create', paymentRequestController.createPaymentRequest);

/**
 * @swagger
 * /users/payments/split/create:
 *   post:
 *     tags: [User]
 *     summary: Create group split payment request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *     responses:
 *       201:
 *         description: Group split payment request created successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/payments/split/create', paymentRequestController.createGroupSplitPayment);

/**
 * @swagger
 * /users/payments/{paymentId}:
 *   get:
 *     tags: [User]
 *     summary: Get payment request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment request
 *     responses:
 *       200:
 *         description: Payment request retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/payments/:paymentId', paymentRequestController.getPaymentRequest);



// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [user, admin]
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// User Profile Routes
/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [User]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add profile update parameters here
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', userController.updateUser);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     tags: [User]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: User's new password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', userController.changePassword);

/**
 * @swagger
 * /users/account:
 *   delete:
 *     tags: [User]
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/account', userController.deleteAccount);

// Transaction Routes
/**
 * @swagger
 * /users/transactions:
 *   get:
 *     tags: [User]
 *     summary: Get user transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', userController.getUserTransactions);

// Wallet Routes
/**
 * @swagger
 * /users/wallet:
 *   get:
 *     tags: [User]
 *     summary: Get user wallet balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/wallet', walletController.getWalletBalance);

/**
 * @swagger
 * /users/wallet/transactions:
 *   get:
 *     tags: [User]
 *     summary: Get user wallet transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/wallet/transactions', walletController.getWalletTransactions);

/**
 * @swagger
 * /users/wallet/withdraw:
 *   post:
 *     tags: [User]
 *     summary: Withdraw from wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to withdraw
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/wallet/withdraw', walletController.withdrawFromWallet);

/**
 * @swagger
 * /users/wallet/stats:
 *   get:
 *     tags: [User]
 *     summary: Get user wallet statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/wallet/stats', walletController.getWalletStats);

/**
 * @swagger
 * /users/payments/history:
 *   get:
 *     tags: [User]
 *     summary: Get user payment history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/payments/history', paymentRequestController.getUserPaymentHistory);

module.exports = router;