import { Router } from 'express';
import { Admin/analyticsController } from '../controllers/admin/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const admin/analyticsController = new Admin/analyticsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', admin/analyticsController.getAll);





export default router;