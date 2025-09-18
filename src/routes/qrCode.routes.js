const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCode.controller');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { api: rateLimit } = require('../middleware/rateLimiter');

// Apply rate limiting to all routes
router.use(rateLimit);

// Generate QR code
router.post('/generate', auth, qrCodeController.generateQRCode);

// Get merchant's QR codes
router.get('/', auth, qrCodeController.getQRCodes);

// Get QR code by ID
router.get('/:id', auth, validate(schemas.uuidParam, 'params'), qrCodeController.getQRCode);

// Update QR code
router.put('/:id', auth, validate(schemas.uuidParam, 'params'), qrCodeController.updateQRCode);

// Deactivate QR code
router.delete('/:id', auth, validate(schemas.uuidParam, 'params'), qrCodeController.deactivateQRCode);

// Get QR code statistics
router.get('/stats/overview', auth, qrCodeController.getQRCodeStats);

module.exports = router;
