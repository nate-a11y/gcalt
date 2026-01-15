import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { generateToken } from '../lib/auth';
import { mockDb } from '../lib/db';

export const authRoutes = new Hono();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRoutes.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const data = signupSchema.parse(body);

    // Check if email already exists
    const existingUser = Array.from(mockDb.users.values()).find(
      (u) => u.email === data.email
    );
    if (existingUser) {
      return c.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } },
        400
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = {
      id: nanoid(),
      email: data.email,
      name: data.name,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.users.set(user.id, user);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        400
      );
    }
    throw error;
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    // Find user
    const user = Array.from(mockDb.users.values()).find(
      (u) => u.email === data.email
    );

    if (!user) {
      return c.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        401
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      return c.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        401
      );
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        400
      );
    }
    throw error;
  }
});

authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } }, 401);
  }

  const { verifyToken } = await import('../lib/auth');
  const payload = verifyToken(authHeader.substring(7));
  if (!payload) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401);
  }

  const user = mockDb.users.get(payload.userId);
  if (!user) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});
