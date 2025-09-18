
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction-related operations
 */

// Create transaction
/**
 * @swagger
 * /transaction/create:
 *   post:
 *     tags: [Transaction]
 *     summary: Create a new transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add transaction creation parameters here
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/create', auth, transactionController.createTransaction);

// Get transactions with filters
/**
 * @swagger
 * /transaction:
 *   get:
 *     tags: [Transaction]
 *     summary: Get transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [pay_for_me, group_split]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, transactionController.getTransactions);

// Get transaction by ID
/**
 * @swagger
 * /transaction/{id}:
 *   get:
 *     tags: [Transaction]
 *     summary: Get transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, transactionController.getTransaction);

// Initialize payment
/**
 * @swagger
 * /transaction/{id}/initialize:
 *   post:
 *     tags: [Transaction]
 *     summary: Initialize payment for a transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/initialize', auth, transactionController.initializePayment);

// Verify payment
/**
 * @swagger
 * /transaction/verify/{reference}:
 *   get:
 *     tags: [Transaction]
 *     summary: Verify payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment reference
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/verify/:reference', auth, transactionController.verifyPayment);

// Send payment reminders (for group splits)
/**
 * @swagger
 * /transaction/{id}/reminders:
 *   post:
 *     tags: [Transaction]
 *     summary: Send payment reminders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction
 *     responses:
 *       200:
 *         description: Reminders sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/reminders', auth, transactionController.sendReminders);

// Cancel transaction
/**
 * @swagger
 * /transaction/{id}/cancel:
 *   put:
 *     tags: [Transaction]
 *     summary: Cancel transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction
 *     responses:
 *       200:
 *         description: Transaction cancelled successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/cancel', auth, transactionController.cancelTransaction);

module.exports = router;