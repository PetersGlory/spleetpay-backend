import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const healthController = new HealthController();

// Apply authentication to all routes
router.use(authenticateToken);


router.get('/:id', healthController.getById);




export default router;