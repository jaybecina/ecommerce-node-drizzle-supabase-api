import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw error || new Error('User not found');
    }

    // Get user's role from user metadata or a separate profile table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'customer', // default to customer if no role specified
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      error: 'Invalid token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

export function verifySeller(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'seller') {
    res.status(401).json({ error: 'Access denied. Seller role required.' });
    return;
  }
  next();
}
