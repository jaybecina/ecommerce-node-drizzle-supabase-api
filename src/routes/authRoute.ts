import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', verifyToken, logout);

export default router;
