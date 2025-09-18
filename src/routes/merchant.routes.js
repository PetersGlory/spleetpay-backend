const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchant.controller');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadKYCDocument, handleUploadError } = require('../middleware/upload');


// Merchant registration and profile
router.post('/register', auth, merchantController.registerMerchant);
router.get('/profile', auth, merchantController.getMerchantProfile);
router.put('/profile', auth, merchantController.updateMerchantProfile);

// KYC submission
router.post('/kyc/submit', auth, merchantController.submitKYC);
router.post('/kyc/upload', auth, uploadKYCDocument('document'), handleUploadError, merchantController.uploadKYCDocument);

// API key management
router.post('/api-key/generate', auth, merchantController.generateAPIKey);

// Merchant statistics
router.get('/stats', auth, merchantController.getMerchantStats);

// Admin routes
router.get('/all', adminAuth, merchantController.getAllMerchants);
router.put('/:id/approve', adminAuth, merchantController.approveMerchant);

module.exports = router;
