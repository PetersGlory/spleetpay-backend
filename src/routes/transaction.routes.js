const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { auth, adminAuth } = require('../middleware/auth');

// Create transaction
router.post('/create', auth, transactionController.createTransaction);

// Get transactions with filters
router.get('/', auth, transactionController.getTransactions);

// Get transaction by ID
router.get('/:id', auth, transactionController.getTransaction);

// Initialize payment
router.post('/:id/initialize', auth, transactionController.initializePayment);

// Verify payment
router.get('/verify/:reference', auth, transactionController.verifyPayment);

// Send payment reminders (for group splits)
router.post('/:id/reminders', auth, transactionController.sendReminders);

// Cancel transaction
router.put('/:id/cancel', auth, transactionController.cancelTransaction);

module.exports = router;
