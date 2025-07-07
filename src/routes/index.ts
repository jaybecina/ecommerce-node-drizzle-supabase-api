import { Router } from 'express';
import productsRoutes from './productRoute';
import authRoutes from './authRoute';
import ordersRoutes from './orderRoute';
import stripeRoutes from './stripeRoute';

const router = Router();

router.use('/products', productsRoutes);
router.use('/auth', authRoutes);
router.use('/orders', ordersRoutes);
router.use('/stripe', stripeRoutes);

export default router;
