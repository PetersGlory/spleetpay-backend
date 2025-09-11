import { Router } from 'express';
import { WebhooksSettlementStatusController } from '../controllers/webhooks/settlement-status.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const webhooksSettlementStatusController = new WebhooksSettlementStatusController();

// Apply authentication to all routes
router.use(authenticateToken);



router.post('/', webhooksSettlementStatusController.create);



export default router;