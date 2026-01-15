import { Hono } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../lib/auth';
import { mockDb } from '../lib/db';

export const messagesRoutes = new Hono();

messagesRoutes.use('*', authMiddleware);

const createMessageSchema = z.object({
  content: z.string().min(1),
  isAnnouncement: z.boolean().optional(),
});

// List messages for a team
messagesRoutes.get('/', async (c) => {
  const teamId = c.req.param('teamId');

  const messages = Array.from(mockDb.messages.values())
    .filter((m) => m.teamId === teamId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => {
      // Attach sender info
      const sender = mockDb.users.get(m.senderId);
      return {
        ...m,
        senderName: sender?.name || 'Unknown',
      };
    });

  return c.json({ success: true, messages });
});

// Send message
messagesRoutes.post('/', async (c) => {
  try {
    const teamId = c.req.param('teamId');
    const userId = c.get('userId');
    const body = await c.req.json();
    const data = createMessageSchema.parse(body);

    const message = {
      id: nanoid(),
      teamId,
      senderId: userId,
      content: data.content,
      isAnnouncement: data.isAnnouncement || false,
      createdAt: new Date().toISOString(),
    };

    mockDb.messages.set(message.id, message);

    // Get sender info
    const sender = mockDb.users.get(userId);

    return c.json(
      {
        success: true,
        message: {
          ...message,
          senderName: sender?.name || 'Unknown',
        },
      },
      201
    );
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
