import { Router } from 'express';
import { Qr-codesController } from '../controllers/qr-codes.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const qr-codesController = new Qr-codesController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', qr-codesController.getAll);
router.get('/:id', qr-codesController.getById);
router.post('/', qr-codesController.create);
router.put('/:id', qr-codesController.update);
router.delete('/:id', qr-codesController.delete);

export default router;