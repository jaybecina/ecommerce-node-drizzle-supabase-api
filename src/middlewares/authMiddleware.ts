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

    // Get user's roles and permissions
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select(
        `
        roles (
          name
        ),
        roles!inner (
          role_permissions (
            permissions (
              name
            )
          )
        )
      `,
      )
      .eq('user_id', user.id);

    interface RoleData {
      roles: { name: string }[];
      'roles!inner': {
        role_permissions: {
          permissions: { name: string }[];
        }[];
      }[];
    }

    const userRoles = userRolesData as RoleData[] | null;

    const roles = userRoles?.length
      ? [...new Set(userRoles.flatMap((ur) => ur.roles.map((r) => r.name)))]
      : ['customer'];

    const permissions = userRoles?.length
      ? [
          ...new Set(
            userRoles.flatMap((ur) =>
              ur['roles!inner'].flatMap((r) =>
                r.role_permissions.flatMap((rp) => rp.permissions.map((p) => p.name)),
              ),
            ),
          ),
        ]
      : [];

    req.user = {
      id: user.id,
      email: user.email!,
      roles,
      permissions,
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

export function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.roles.includes('admin')) {
    res.status(401).json({ error: 'Access denied. Admin role required.' });
    return;
  }
  next();
}

export function verifySeller(req: Request, res: Response, next: NextFunction) {
  // Allow both admin and seller roles
  if (!req.user?.roles.some((role) => ['admin', 'seller'].includes(role))) {
    res.status(401).json({ error: 'Access denied. Seller role required.' });
    return;
  }
  next();
}

export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.roles.some((role) => roles.includes(role))) {
      res.status(401).json({
        error: `Access denied. One of these roles required: ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
}

export function hasPermission(permission: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];

    // Admin role bypasses permission checks
    if (req.user?.roles.includes('admin')) {
      return next();
    }

    if (!requiredPermissions.every((p) => req.user?.permissions.includes(p))) {
      res.status(401).json({
        error: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      });
      return;
    }
    next();
  };
}
