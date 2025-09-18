const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { auth, adminAuth } = require('../middleware/auth');


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phone
 *               - gender
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (min 6 characters)
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               gender:
 *                 type: string
 *                 description: User's gender
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: 
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

// Admin login
router.post('/admin/login', authController.adminLogin);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Email verification with OTP
router.post('/verify-email', authController.verifyEmail);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Logout
router.post('/logout', auth, authController.logout);

module.exports = router;