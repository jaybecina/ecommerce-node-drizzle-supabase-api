import { Router } from "express";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema,
} from "../controllers/productsController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { verifySeller, verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  verifyToken,
  verifySeller,
  validateData(createProductSchema),
  createProduct
);
router.put(
  "/:id",
  verifyToken,
  verifySeller,
  validateData(updateProductSchema),
  updateProduct
);
router.delete("/:id", verifyToken, verifySeller, deleteProduct);

export default router;
