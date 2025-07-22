import { Router } from 'express';
import { createOrder, listOrders, getOrderById } from '../controllers/ordersController';
import { createOrderSchema } from '../services/ordersService';
import { validateData } from '../middlewares/validationMiddleware';
import { verifyToken } from '../middlewares/authMiddleware';
import { orderLimiter, defaultLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

// Protected routes (require authentication)
router.use(verifyToken);

router.post('/', orderLimiter, validateData(createOrderSchema), createOrder);
router.get('/', defaultLimiter, listOrders);
router.get('/:id', defaultLimiter, getOrderById);

export default router;
