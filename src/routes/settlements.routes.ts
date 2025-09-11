import { Router } from 'express';
import { SettlementsController } from '../controllers/settlements.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const settlementsController = new SettlementsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', settlementsController.getAll);
router.get('/:id', settlementsController.getById);
router.post('/', settlementsController.create);
router.put('/:id', settlementsController.update);
router.delete('/:id', settlementsController.delete);

export default router;