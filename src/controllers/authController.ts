import { Request, Response } from 'express';
import { z } from 'zod';
import {
  registerService,
  loginService,
  logoutService,
  registerSchema,
  loginSchema,
} from '../services/authService';

// Controller methods
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerService(data);
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginService(data);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error(error);
    res.status(401).json({ error: (error as Error).message || 'Invalid credentials' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await logoutService();
    res.json(result);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to log out' });
  }
};
