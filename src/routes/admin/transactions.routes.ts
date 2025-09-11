import { Router } from 'express';
import { Admin/transactionsController } from '../controllers/admin/transactions.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const admin/transactionsController = new Admin/transactionsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', admin/transactionsController.getAll);





export default router;