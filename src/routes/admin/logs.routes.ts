import { Router } from 'express';
import { Admin/logsController } from '../controllers/admin/logs.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const admin/logsController = new Admin/logsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', admin/logsController.getAll);





export default router;