import { Router } from 'express';
import { createOrder, listOrders, getOrderById } from '../controllers/ordersController.js';
import { createOrderSchema } from '../services/ordersService.js';
import { validateData } from '../middlewares/validationMiddleware.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { orderLimiter, defaultLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Protected routes (require authentication)
router.use(verifyToken);

router.post('/', orderLimiter, validateData(createOrderSchema), createOrder);
router.get('/', defaultLimiter, listOrders);
router.get('/:id', defaultLimiter, getOrderById);

export default router;
