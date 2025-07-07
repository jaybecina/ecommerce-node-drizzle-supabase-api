import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema,
} from '../controllers/productsController.js';
import { validateData } from '../middlewares/validationMiddleware.js';
import { verifySeller, verifyToken } from '../middlewares/authMiddleware.js';
import { defaultLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.get('/', defaultLimiter, listProducts);
router.get('/:id', defaultLimiter, getProductById);
router.post(
  '/',
  defaultLimiter,
  verifyToken,
  verifySeller,
  validateData(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  defaultLimiter,
  verifyToken,
  verifySeller,
  validateData(updateProductSchema),
  updateProduct
);
router.delete('/:id', defaultLimiter, verifyToken, verifySeller, deleteProduct);

export default router;
