import { Hono } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../lib/auth';
import { mockDb } from '../lib/db';

export const playersRoutes = new Hono();

playersRoutes.use('*', authMiddleware);

const createPlayerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jerseyNumber: z.string().optional(),
  position: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const updatePlayerSchema = createPlayerSchema.partial();

// List players for a team
playersRoutes.get('/', async (c) => {
  const teamId = c.req.param('teamId');

  const players = Array.from(mockDb.players.values())
    .filter((p) => p.teamId === teamId)
    .sort((a, b) => {
      // Sort by jersey number if available, then by name
      if (a.jerseyNumber && b.jerseyNumber) {
        return parseInt(a.jerseyNumber) - parseInt(b.jerseyNumber);
      }
      return a.lastName.localeCompare(b.lastName);
    });

  return c.json({ success: true, players });
});

// Get single player
playersRoutes.get('/:playerId', async (c) => {
  const playerId = c.req.param('playerId');

  const player = mockDb.players.get(playerId);
  if (!player) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Player not found' } },
      404
    );
  }

  return c.json({ success: true, player });
});

// Create player
playersRoutes.post('/', async (c) => {
  try {
    const teamId = c.req.param('teamId');
    const body = await c.req.json();
    const data = createPlayerSchema.parse(body);

    const player = {
      id: nanoid(),
      teamId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.players.set(player.id, player);

    return c.json({ success: true, player }, 201);
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

// Update player
playersRoutes.patch('/:playerId', async (c) => {
  try {
    const playerId = c.req.param('playerId');
    const body = await c.req.json();
    const data = updatePlayerSchema.parse(body);

    const player = mockDb.players.get(playerId);
    if (!player) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Player not found' } },
        404
      );
    }

    const updatedPlayer = {
      ...player,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockDb.players.set(playerId, updatedPlayer);

    return c.json({ success: true, player: updatedPlayer });
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

// Delete player
playersRoutes.delete('/:playerId', async (c) => {
  const playerId = c.req.param('playerId');

  const player = mockDb.players.get(playerId);
  if (!player) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Player not found' } },
      404
    );
  }

  mockDb.players.delete(playerId);

  return c.json({ success: true });
});
