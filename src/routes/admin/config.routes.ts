import { Router } from 'express';
import { Admin/configController } from '../controllers/admin/config.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const admin/configController = new Admin/configController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', admin/configController.getAll);


router.put('/:id', admin/configController.update);


export default router;