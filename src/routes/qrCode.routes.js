
const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCode.controller');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: QR Code
 *   description: QR Code management
 */

// Generate QR code
/**
 * @swagger
 * /qr-code/generate:
 *   post:
 *     tags: [QR Code]
 *     summary: Generate a QR code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add QR code generation parameters here
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/generate', auth, qrCodeController.generateQRCode);

// Get merchant's QR codes
/**
 * @swagger
 * /qr-code:
 *   get:
 *     tags: [QR Code]
 *     summary: Get merchant's QR codes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR codes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, qrCodeController.getQRCodes);

// Get QR code by ID
/**
 * @swagger
 * /qr-code/{id}:
 *   get:
 *     tags: [QR Code]
 *     summary: Get QR code by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the QR code
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, qrCodeController.getQRCode);

// Update QR code
/**
 * @swagger
 * /qr-code/{id}:
 *   put:
 *     tags: [QR Code]
 *     summary: Update QR code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the QR code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Add QR code update parameters here
 *     responses:
 *       200:
 *         description: QR code updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, qrCodeController.updateQRCode);

// Deactivate QR code
/**
 * @swagger
 * /qr-code/{id}:
 *   delete:
 *     tags: [QR Code]
 *     summary: Deactivate QR code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the QR code
 *     responses:
 *       200:
 *         description: QR code deactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, qrCodeController.deactivateQRCode);

// Get QR code statistics
/**
 * @swagger
 * /qr-code/stats/overview:
 *   get:
 *     tags: [QR Code]
 *     summary: Get QR code statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats/overview', auth, qrCodeController.getQRCodeStats);

module.exports = router;
