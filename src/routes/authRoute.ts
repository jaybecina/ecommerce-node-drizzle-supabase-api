import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', verifyToken, logout);

export default router;
