
const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchant.controller');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadKYCDocument, handleUploadError } = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Merchant
 *   description: Merchant-related operations
 */

// Merchant registration and profile
/**
 * @swagger
 * /merchant/register:
 *   post:
 *     tags: [Merchant]
 *     summary: Register a new merchant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessType
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: The merchant's business name
 *               businessType:
 *                 type: string
 *                 description: The merchant's business type
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The merchant's email
 *               phoneNumber:
 *                 type: string
 *                 description: The merchant's phone number
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: The merchant's password (minimum 6 characters)
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/register', auth, merchantController.registerMerchant);

/**
 * @swagger
 * /merchant/profile:
 *   get:
 *     tags: [Merchant]
 *     summary: Get merchant profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth, merchantController.getMerchantProfile);

/**
 * @swagger
 * /merchant/profile:
 *   put:
 *     tags: [Merchant]
 *     summary: Update merchant profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: The merchant's business name
 *               businessType:
 *                 type: string
 *                 description: The merchant's business type
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The merchant's email
 *               phoneNumber:
 *                 type: string
 *                 description: The merchant's phone number
 *     responses:
 *       200:
 *         description: Merchant profile updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', auth, merchantController.updateMerchantProfile);

/**
 * @swagger
 * /merchant/kyc/submit:
 *   post:
 *     tags: [Merchant]
 *     summary: Submit KYC information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add KYC submission parameters here
 *     responses:
 *       200:
 *         description: KYC information submitted successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/kyc/submit', auth, merchantController.submitKYC);

/**
 * @swagger
 * /merchant/kyc/upload:
 *   post:
 *     tags: [Merchant]
 *     summary: Upload KYC document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: The KYC document file
 *     responses:
 *       200:
 *         description: KYC document uploaded successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
router.post('/kyc/upload', auth, uploadKYCDocument('document'), handleUploadError, merchantController.uploadKYCDocument);

/**
 * @swagger
 * /merchant/api-key/generate:
 *   post:
 *     tags: [Merchant]
 *     summary: Generate API key
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/api-key/generate', auth, merchantController.generateAPIKey);

/**
 * @swagger
 * /merchant/stats:
 *   get:
 *     tags: [Merchant]
 *     summary: Get merchant statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, merchantController.getMerchantStats);

// Admin routes
/**
 * @swagger
 * /admin/merchants/all:
 *   get:
 *     tags: [Merchant]
 *     summary: Get all merchants (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchants retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/all', adminAuth, merchantController.getAllMerchants);

/**
 * @swagger
 * /admin/merchants/{id}/approve:
 *   put:
 *     tags: [Merchant]
 *     summary: Approve merchant (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Merchant ID
 *     responses:
 *       200:
 *         description: Merchant approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Merchant not found
 */
router.put('/:id/approve', adminAuth, merchantController.approveMerchant);

module.exports = router;
