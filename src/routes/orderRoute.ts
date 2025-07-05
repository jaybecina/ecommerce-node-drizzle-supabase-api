import { Router } from "express";
import {
  createOrder,
  listOrders,
  getOrderById,
  createOrderSchema,
} from "../controllers/ordersController.js";
import { validateData } from "../middlewares/validationMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Protected routes (require authentication)
router.use(verifyToken);

router.post("/", validateData(createOrderSchema), createOrder);
router.get("/", listOrders);
router.get("/:id", getOrderById);

export default router;
