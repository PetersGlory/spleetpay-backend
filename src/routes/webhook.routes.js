const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Paystack webhooks
router.post('/paystack', webhookController.handlePaystackWebhook);

// Settlement webhooks
router.post('/settlement', webhookController.handleSettlementWebhook);

// Group split payment notifications
router.post('/group-split', webhookController.handleGroupSplitPayment);

module.exports = router;
