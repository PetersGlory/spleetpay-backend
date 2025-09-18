const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const paymentRequestController = require('../controllers/paymentRequest.controller');
const walletController = require('../controllers/wallet.controller');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
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
router.get('/profile', userController.getUser);
router.put('/profile', userController.updateUser);
router.put('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

// Transaction Routes
router.get('/transactions', userController.getUserTransactions);

// Wallet Routes
router.get('/wallet', walletController.getWalletBalance);
router.get('/wallet/transactions', walletController.getWalletTransactions);
router.post('/wallet/withdraw', walletController.withdrawFromWallet);
router.get('/wallet/stats', walletController.getWalletStats);

// Payment Request Routes
router.post('/payments/create', paymentRequestController.createPaymentRequest);
router.post('/payments/split/create', paymentRequestController.createGroupSplitPayment);
router.get('/payments/:paymentId', paymentRequestController.getPaymentRequest);
router.get('/payments/history', paymentRequestController.getUserPaymentHistory);

module.exports = router;