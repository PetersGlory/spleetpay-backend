import { Router } from 'express';
import { Admin/settlementsController } from '../controllers/admin/settlements.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const admin/settlementsController = new Admin/settlementsController();

// Apply authentication to all routes
router.use(authenticateToken);







export default router;