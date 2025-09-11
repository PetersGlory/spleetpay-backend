import { Router } from 'express';
import { WebhookspaymentStatusController } from '../controllers/webhooks/payment-status.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const webhookspaymentStatusController = new WebhookspaymentStatusController();

// Apply authentication to all routes
router.use(authenticateToken);



router.post('/', webhookspaymentStatusController.create);



export default router;