const express = require('express');
const router = express.Router();

const paymentRateController = require('../controllers/paymentRate.controller');
const {adminAuth} = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: PaymentRate
 *   description: Payment rates management
 */

/**
 * @swagger
 * /payment-rate:
 *   post:
 *     tags: [PaymentRate]
 *     summary: Create a new payment rate
 *     description: Add a new payment rate to the system
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
 *               ratePercentage:
 *                 type: number
 *                 example: 1.5
 *               slugType:
 *                 type: string
 *                 example: transaction
 *     responses:
 *       201:
 *         description: Payment rate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentRate'
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post(
  '/payment-rate', 
  adminAuth, 
  paymentRateController.createPaymentRate
);

/**
 * @swagger
 * /payment-rate/{id}:
 *   put:
 *     tags: [PaymentRate]
 *     summary: Update an existing payment rate
 *     description: Update the details of a payment rate by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PaymentRate'
 *                 message:
 *                   type: string
 *       404:
 *         description: Payment rate not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/payment-rate/:id',
  adminAuth,
  paymentRateController.updatePaymentRate
);

/**
 * @swagger
 * /payment-rate/{id}:
 *   delete:
 *     tags: [PaymentRate]
 *     summary: Delete a payment rate
 *     description: Remove a payment rate from the system by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Payment rate ID
 *     responses:
 *       200:
 *         description: Payment rate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Payment rate not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/payment-rate/:id',
  adminAuth,
  paymentRateController.deletePaymentRate
);

module.exports = router;
