import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { mockDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'sideline-dev-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
      401
    );
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
      401
    );
  }

  // Get user from mock DB
  const user = mockDb.users.get(payload.userId);
  if (!user) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } },
      401
    );
  }

  c.set('user', user);
  c.set('userId', payload.userId);

  await next();
}
