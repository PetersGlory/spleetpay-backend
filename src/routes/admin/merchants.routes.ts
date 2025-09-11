import { Router } from 'express';
import { Admin/merchantsController } from '../controllers/admin/merchants.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const admin/merchantsController = new Admin/merchantsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', admin/merchantsController.getAll);





export default router;