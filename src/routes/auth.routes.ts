import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken, authenticateAdmin, authenticateMerchant } from '../middleware/auth.js';

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post('/admin/login', authController.adminLogin);
router.post('/merchant/login', authController.merchantLogin);
router.post('/merchant/register', authController.merchantRegister);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);

// Admin only routes
router.post('/admin/register', authenticateAdmin, authController.adminRegister);

export default router;