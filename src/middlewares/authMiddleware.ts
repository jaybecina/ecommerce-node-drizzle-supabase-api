import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-jwt-secret"
    ) as jwt.JwtPayload;

    if (!decoded?.id || !decoded?.email || !decoded?.role) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export function verifySeller(req: Request, res: Response, next: NextFunction) {
  const role = req.role;
  if (role !== "seller") {
    res.status(401).json({ error: "Access denied" });
    return;
  }
  next();
}
