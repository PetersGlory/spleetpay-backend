const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCode.controller');
const { auth } = require('../middleware/auth');

// Generate QR code
router.post('/generate', auth, qrCodeController.generateQRCode);

// Get merchant's QR codes
router.get('/', auth, qrCodeController.getQRCodes);

// Get QR code by ID
router.get('/:id', auth, qrCodeController.getQRCode);

// Update QR code
router.put('/:id', auth, qrCodeController.updateQRCode);

// Deactivate QR code
router.delete('/:id', auth, qrCodeController.deactivateQRCode);

// Get QR code statistics
router.get('/stats/overview', auth, qrCodeController.getQRCodeStats);

module.exports = router;
