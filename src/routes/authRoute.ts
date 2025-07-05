import { Router } from "express";
import { register, login, logout } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

export default router;
