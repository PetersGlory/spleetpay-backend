import { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const transactionsController = new TransactionsController();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', transactionsController.getAll);
router.get('/:id', transactionsController.getById);
router.post('/', transactionsController.create);
router.put('/:id', transactionsController.update);
router.delete('/:id', transactionsController.delete);

export default router;