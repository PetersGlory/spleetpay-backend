
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Utility
 *   description: Utility endpoints
 */

// Get current exchange rates
/**
 * @swagger
 * /utils/exchange-rates:
 *   get:
 *     tags: [Utility]
 *     summary: Get current exchange rates
 *     responses:
 *       200:
 *         description: Exchange rates retrieved successfully
 *       500:
 *         description: Failed to fetch exchange rates
 */
router.get('/exchange-rates', async (req, res) => {
  try {
    // TODO: Integrate with real exchange rate API (XE API, etc.)
    const rates = {
      base_currency: 'NGN',
      rates: {
        USD: 0.0012,
        GBP: 0.00098,
        GHS: 0.125,
        EUR: 0.0011
      },
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch exchange rates'
      }
    });
  }
});

// Send payment reminder notification
/**
 * @swagger
 * /utils/send-notification:
 *   post:
 *     tags: [Utility]
 *     summary: Send payment reminder notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of notification (e.g., email, sms)
 *               recipient:
 *                 type: string
 *                 description: The recipient of the notification (e.g., email address, phone number)
 *               message:
 *                 type: string
 *                 description: The message to send
 *               paymentLink:
 *                 type: string
 *                 description: The payment link (optional)
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       500:
 *         description: Failed to send notification
 */
router.post('/send-notification', async (req, res) => {
  try {
    const { type, recipient, message, paymentLink } = req.body;

    // TODO: Integrate with Twilio for SMS, WhatsApp API, SendGrid for email
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        type,
        recipient,
        sent: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send notification'
      }
    });
  }
});

module.exports = router;