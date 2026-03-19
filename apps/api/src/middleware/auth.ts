import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

const { verify } = jwt;

export type UserRole = 'ADMIN' | 'VISITOR';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

export const authenticate = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verify(token, JWT_ACCESS_SECRET) as JWTPayload;
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ success: false, error: 'Unauthorized: Invalid token' }, 401);
  }
};

export const requireAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (!user || user.role !== 'ADMIN') {
    return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
  }

  await next();
};

export const optionalAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verify(token, JWT_ACCESS_SECRET) as JWTPayload;
      c.set('user', decoded);
    } catch (error) {
      // 忽略错误，继续执行
    }
  }

  await next();
};
