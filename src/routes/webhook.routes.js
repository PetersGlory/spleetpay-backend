
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

/**
 * @swagger
 * tags:
 *   name: Webhook
 *   description: Webhook endpoints for receiving notifications
 */

// Paystack webhooks
/**
 * @swagger
 * /webhook/paystack:
 *   post:
 *     tags: [Webhook]
 *     summary: Handle Paystack webhooks
 *     description: Endpoint for receiving Paystack webhook notifications.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             // Define Paystack webhook payload schema here
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Bad Request
 */
router.post('/paystack', webhookController.handlePaystackWebhook);

// Settlement webhooks
/**
 * @swagger
 * /webhook/settlement:
 *   post:
 *     tags: [Webhook]
 *     summary: Handle settlement webhooks
 *     description: Endpoint for receiving settlement webhook notifications.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             // Define settlement webhook payload schema here
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Bad Request
 */
router.post('/settlement', webhookController.handleSettlementWebhook);

// Group split payment notifications
/**
 * @swagger
 * /webhook/group-split:
 *   post:
 *     tags: [Webhook]
 *     summary: Handle group split payment notifications
 *     description: Endpoint for receiving group split payment notifications.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             // Define group split payment notification payload schema here
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Bad Request
 */
router.post('/group-split', webhookController.handleGroupSplitPayment);

module.exports = router;
