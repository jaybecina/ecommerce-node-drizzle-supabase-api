import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productsController';
import { createProductSchema, updateProductSchema } from '../services/productsService';
import { validateData } from '../middlewares/validationMiddleware';
import { verifySeller, verifyToken } from '../middlewares/authMiddleware';
import { defaultLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

router.get('/', defaultLimiter, listProducts);
router.get('/:id', defaultLimiter, getProductById);
router.post(
  '/',
  defaultLimiter,
  verifyToken,
  verifySeller,
  validateData(createProductSchema),
  createProduct,
);
router.put(
  '/:id',
  defaultLimiter,
  verifyToken,
  verifySeller,
  validateData(updateProductSchema),
  updateProduct,
);
router.delete('/:id', defaultLimiter, verifyToken, verifySeller, deleteProduct);

export default router;
