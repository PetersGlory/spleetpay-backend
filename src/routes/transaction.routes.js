const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { auth, adminAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { api: rateLimit } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(rateLimit);

// Create transaction
router.post('/create', auth, validate(schemas.transactionCreation), transactionController.createTransaction);

// Get transactions with filters
router.get('/', auth, transactionController.getTransactions);

// Get transaction by ID
router.get('/:id', auth, validate(schemas.uuidParam, 'params'), transactionController.getTransaction);

// Initialize payment
router.post('/:id/initialize', auth, transactionController.initializePayment);

// Verify payment
router.get('/verify/:reference', auth, transactionController.verifyPayment);

// Send payment reminders (for group splits)
router.post('/:id/reminders', auth, transactionController.sendReminders);

// Cancel transaction
router.put('/:id/cancel', auth, transactionController.cancelTransaction);

module.exports = router;
