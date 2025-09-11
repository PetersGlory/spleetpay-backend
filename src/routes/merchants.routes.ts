import { Router } from 'express';
import { MerchantsController } from '../controllers/merchants.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const merchantsController = new MerchantsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', merchantsController.getAll);
router.get('/:id', merchantsController.getById);
router.post('/', merchantsController.create);
router.put('/:id', merchantsController.update);
router.delete('/:id', merchantsController.delete);

export default router;