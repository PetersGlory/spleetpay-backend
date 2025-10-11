
const express = require('express');
const router = express.Router();
const paymentRequestController = require('../controllers/paymentRequest.controller');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment-related operations
 */

// Public payment routes (no authentication required)

/**
 * @swagger
 * /payment/link/{linkToken}:
 *   get:
 *     tags: [Payment]
 *     summary: Get payment by link token
 *     parameters:
 *       - in: path
 *         name: linkToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The link token for the payment.
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get('/link/:linkToken', paymentRequestController.getPaymentByLink);

/**
 * @swagger
 * /payment/{paymentId}/participants/{participantId}/pay:
 *   post:
 *     tags: [Payment]
 *     summary: Process payment for a specific participant
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment.
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the participant.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add payment processing parameters here
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Bad Request
 */
router.post('/:paymentId/participants/:participantId/pay', paymentRequestController.processParticipantPayment);

module.exports = router;