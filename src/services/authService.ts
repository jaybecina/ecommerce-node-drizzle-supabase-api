import { supabase } from '../config/supabase.js';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['buyer', 'seller']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerService(data: z.infer<typeof registerSchema>) {
  const { email, password, name, role } = data;

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
    throw new Error(authError.message);
  }

  return {
    id: authData.user?.id,
    email: authData.user?.email,
    name,
    role,
  };
}

export async function loginService(data: z.infer<typeof loginSchema>) {
  const { email, password } = data;

  const {
    data: { user, session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!user || !session) {
    throw new Error('Invalid credentials');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name,
      role: user.user_metadata.role,
    },
    token: session.access_token,
  };
}

export async function logoutService() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return { message: 'Logged out successfully' };
}
