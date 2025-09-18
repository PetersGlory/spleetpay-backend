const express = require('express');
const router = express.Router();
const paymentRequestController = require('../controllers/paymentRequest.controller');

// Public payment routes (no authentication required)

// Access payment via public link
router.get('/link/:linkToken', paymentRequestController.getPaymentByLink);

// Process payment for specific participant (public access)
router.post('/:paymentId/participants/:participantId/pay', paymentRequestController.processParticipantPayment);

module.exports = router;
