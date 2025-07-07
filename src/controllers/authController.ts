import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['buyer', 'seller']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Controller methods
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = registerSchema.parse(req.body);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      res.status(400).json({ error: authError.message });
      return;
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        name,
        role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (!user || !session) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name,
        role: user.user_metadata.role,
      },
      token: session.access_token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      error: 'Invalid token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};
