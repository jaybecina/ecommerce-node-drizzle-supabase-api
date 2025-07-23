import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload,
} from '../controllers/productsController';
import { createProductSchema, updateProductSchema } from '../services/productsService';
import { validateData } from '../middlewares/validationMiddleware';
import { verifyToken, hasPermission } from '../middlewares/authMiddleware';
import { defaultLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

// Public routes
router.get('/', defaultLimiter, listProducts);
router.get('/:id', defaultLimiter, getProductById);

// Protected routes
router.post(
  '/',
  defaultLimiter,
  verifyToken,
  hasPermission('create:product'),
  upload.single('image'),
  validateData(createProductSchema),
  createProduct,
);

router.put(
  '/:id',
  defaultLimiter,
  verifyToken,
  hasPermission(['update:product']),
  upload.single('image'),
  validateData(updateProductSchema),
  updateProduct,
);

router.delete(
  '/:id',
  defaultLimiter,
  verifyToken,
  hasPermission(['delete:product']),
  deleteProduct,
);

export default router;
