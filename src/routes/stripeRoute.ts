import { Router } from 'express';
import { createPaymentIntent, getKeys, webhook } from '../controllers/stripeController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

// Note: Guests can get the publishable key
router.get('/keys', getKeys);

router.post('/payment-intent', verifyToken, createPaymentIntent);

router.post('/webhook', webhook);

export default router;
