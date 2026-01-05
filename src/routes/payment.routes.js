
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


/**
 * @swagger
 * /payment/{paymentId}/participants/{participantId}/verify:
 *   post:
 *     tags: [Payment]
 *     summary: Verify a payment for a specific participant
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
 *               reference:
 *                 type: string
 *                 description: The payment reference to verify.
 *               status:
 *                 type: string
 *                 description: Status to verify against ("success", "failed", "pending").
 *             required:
 *               - reference
 *               - status
 *     responses:
 *       200:
 *         description: Payment verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   type: object
 *                   description: The transaction record.
 *                 paymentStatus:
 *                   type: string
 *                   enum: [success, failed, pending]
 *                   description: Status of the verified payment.
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Payment or participant not found
 */
router.post('/:paymentId/participants/:participantId/verify', paymentRequestController.verifyParticipantPayment);


/**
 * @swagger
 * /payment/banks:
 *   get:
 *     tags: [Payment]
 *     summary: Get all supported banks
 *     description: Retrieve a list of all banks supported for payment and disbursement.
 *     responses:
 *       200:
 *         description: A list of supported banks returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 allBanks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Guaranty Trust Bank"
 *                       code:
 *                         type: string
 *                         example: "058"
 *       500:
 *         description: Internal server error
 */
router.get('/banks', paymentRequestController.getAllBanks);


module.exports = router;