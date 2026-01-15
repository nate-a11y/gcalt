import { Hono } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../lib/auth';
import { mockDb } from '../lib/db';

export const eventsRoutes = new Hono();

eventsRoutes.use('*', authMiddleware);

const createEventSchema = z.object({
  type: z.enum(['game', 'practice', 'meeting', 'other']),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  locationAddress: z.string().optional(),
  opponentName: z.string().optional(),
  isHome: z.boolean().optional(),
});

const updateEventSchema = createEventSchema.partial();

// List events for a team
eventsRoutes.get('/', async (c) => {
  const teamId = c.req.param('teamId');

  const events = Array.from(mockDb.events.values())
    .filter((e) => e.teamId === teamId)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return c.json({ success: true, events });
});

// Get single event
eventsRoutes.get('/:eventId', async (c) => {
  const eventId = c.req.param('eventId');

  const event = mockDb.events.get(eventId);
  if (!event) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
      404
    );
  }

  return c.json({ success: true, event });
});

// Create event
eventsRoutes.post('/', async (c) => {
  try {
    const teamId = c.req.param('teamId');
    const body = await c.req.json();
    const data = createEventSchema.parse(body);

    const event = {
      id: nanoid(),
      teamId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.events.set(event.id, event);

    return c.json({ success: true, event }, 201);
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

// Update event
eventsRoutes.patch('/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const body = await c.req.json();
    const data = updateEventSchema.parse(body);

    const event = mockDb.events.get(eventId);
    if (!event) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
        404
      );
    }

    const updatedEvent = {
      ...event,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockDb.events.set(eventId, updatedEvent);

    return c.json({ success: true, event: updatedEvent });
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

// Delete event
eventsRoutes.delete('/:eventId', async (c) => {
  const eventId = c.req.param('eventId');

  const event = mockDb.events.get(eventId);
  if (!event) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
      404
    );
  }

  mockDb.events.delete(eventId);

  // Also delete any associated games
  for (const [id, game] of mockDb.games) {
    if (game.eventId === eventId) {
      mockDb.games.delete(id);
    }
  }

  return c.json({ success: true });
});

// RSVP to event
eventsRoutes.post('/:eventId/rsvp', async (c) => {
  const eventId = c.req.param('eventId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const status = body.status;

  const event = mockDb.events.get(eventId);
  if (!event) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
      404
    );
  }

  // For simplicity, just return success
  // In production, this would store RSVPs in the database
  return c.json({
    success: true,
    rsvp: {
      id: nanoid(),
      eventId,
      userId,
      status,
      createdAt: new Date().toISOString(),
    },
  });
});
