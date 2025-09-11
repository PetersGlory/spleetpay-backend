import { Router } from 'express';
import { GroupSplitsController } from '../controllers/groupSplits.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const groupSplitsController = new GroupSplitsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', groupSplitsController.getAll);
router.get('/:id', groupSplitsController.getById);
router.post('/', groupSplitsController.create);
router.put('/:id', groupSplitsController.update);
router.delete('/:id', groupSplitsController.delete);

export default router;