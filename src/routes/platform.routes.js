const express = require('express');
const router = express.Router();

const authenticatePlatformKey = require('../middleware/authenticatePlatformKey');

// ── Controllers (re-use your existing ones) ──────────────────────────────────
const merchantController  = require('../controllers/merchant.controller');
const paymentController   = require('../controllers/paymentRequest.controller');
const transactionController = require('../controllers/transaction.controller');
const qrCodeController    = require('../controllers/qrCode.controller');

// ── Apply API key auth to every platform route ───────────────────────────────
router.use(authenticatePlatformKey);

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT
// ════════════════════════════════════════════════════════════════════════════
router.get('/account',        merchantController.getMerchantProfile);
router.put('/account',        merchantController.updateMerchantProfile);
router.post('/account/api-key', merchantController.generateAPIKey);
router.get('/account/stats',  merchantController.getMerchantStats);

// ════════════════════════════════════════════════════════════════════════════
// PAY-FOR-ME
// ════════════════════════════════════════════════════════════════════════════
router.post('/payments/pay-for-me',     paymentController.createPaymentRequest);
router.get('/payments/pay-for-me',      paymentController.getUserPaymentHistory);
router.get('/payments/pay-for-me/:id',  paymentController.getPaymentRequest);

// ════════════════════════════════════════════════════════════════════════════
// GROUP SPLIT
// ════════════════════════════════════════════════════════════════════════════
router.post('/payments/group-split',    paymentController.createGroupSplitPayment);
router.get('/payments/group-split',     paymentController.getAllGroupPayments);
router.get('/payments/group-split/:id', paymentController.getPaymentRequest);

// ════════════════════════════════════════════════════════════════════════════
// QR CODES
// ════════════════════════════════════════════════════════════════════════════
router.get('/qr-codes/stats',    qrCodeController.getQRCodeStats);   // before /:id
router.post('/qr-codes',         qrCodeController.generateQRCode);
router.get('/qr-codes',          qrCodeController.getQRCodes);
router.get('/qr-codes/:id',      qrCodeController.getQRCode);
router.put('/qr-codes/:id',      qrCodeController.updateQRCode);
router.delete('/qr-codes/:id',   qrCodeController.deactivateQRCode);

// ════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ════════════════════════════════════════════════════════════════════════════
router.get('/transactions',              transactionController.getTransactions);
router.get('/transactions/:id',          transactionController.getTransaction);
router.post('/transactions/:id/reminders', transactionController.sendReminders);
router.post('/transactions/:id/cancel',  transactionController.cancelTransaction);

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════
router.get('/utils/banks', paymentController.getAllBanks);

module.exports = router;