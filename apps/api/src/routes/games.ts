import { Hono } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../lib/auth';
import { mockDb } from '../lib/db';

export const gamesRoutes = new Hono();

gamesRoutes.use('*', authMiddleware);

const createGameSchema = z.object({
  eventId: z.string(),
});

// List games for a team
gamesRoutes.get('/', async (c) => {
  const teamId = c.req.param('teamId');

  const games = Array.from(mockDb.games.values())
    .filter((g) => g.teamId === teamId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return c.json({ success: true, games });
});

// Get single game
gamesRoutes.get('/:gameId', async (c) => {
  const gameId = c.req.param('gameId');

  const game = mockDb.games.get(gameId);
  if (!game) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
      404
    );
  }

  return c.json({ success: true, game });
});

// Create game from event
gamesRoutes.post('/', async (c) => {
  try {
    const teamId = c.req.param('teamId');
    const body = await c.req.json();
    const data = createGameSchema.parse(body);

    // Get event details
    const event = mockDb.events.get(data.eventId);
    if (!event) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
        404
      );
    }

    const game = {
      id: nanoid(),
      eventId: data.eventId,
      teamId,
      status: 'scheduled',
      homeScore: 0,
      awayScore: 0,
      isHome: event.isHome ?? true,
      opponentName: event.opponentName || 'Opponent',
      currentPeriod: 1,
      gameEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.games.set(game.id, game);

    return c.json({ success: true, game }, 201);
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

// Update game score
gamesRoutes.post('/:gameId/score', async (c) => {
  const gameId = c.req.param('gameId');
  const body = await c.req.json();
  const { homeScore, awayScore } = body;

  const game = mockDb.games.get(gameId);
  if (!game) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
      404
    );
  }

  const updatedGame = {
    ...game,
    homeScore: Math.max(0, homeScore ?? game.homeScore),
    awayScore: Math.max(0, awayScore ?? game.awayScore),
    updatedAt: new Date().toISOString(),
  };

  mockDb.games.set(gameId, updatedGame);

  return c.json({ success: true, game: updatedGame });
});

// Update game status
gamesRoutes.post('/:gameId/status', async (c) => {
  const gameId = c.req.param('gameId');
  const body = await c.req.json();
  const { status } = body;

  const game = mockDb.games.get(gameId);
  if (!game) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
      404
    );
  }

  const validStatuses = ['scheduled', 'in_progress', 'final', 'postponed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return c.json(
      { success: false, error: { code: 'INVALID_STATUS', message: 'Invalid status' } },
      400
    );
  }

  const updatedGame = {
    ...game,
    status,
    updatedAt: new Date().toISOString(),
  };

  mockDb.games.set(gameId, updatedGame);

  return c.json({ success: true, game: updatedGame });
});

// Add game event (play-by-play)
gamesRoutes.post('/:gameId/events', async (c) => {
  const gameId = c.req.param('gameId');
  const body = await c.req.json();

  const game = mockDb.games.get(gameId);
  if (!game) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
      404
    );
  }

  const gameEvent = {
    id: nanoid(),
    gameId,
    type: body.type,
    description: body.description,
    playerId: body.playerId,
    period: body.period || game.currentPeriod,
    timestamp: new Date().toISOString(),
    data: body.data,
  };

  // Add event to game
  const updatedGame = {
    ...game,
    gameEvents: [...(game.gameEvents || []), gameEvent],
    updatedAt: new Date().toISOString(),
  };

  mockDb.games.set(gameId, updatedGame);

  return c.json({ success: true, gameEvent }, 201);
});

// Update period
gamesRoutes.post('/:gameId/period', async (c) => {
  const gameId = c.req.param('gameId');
  const body = await c.req.json();
  const { period } = body;

  const game = mockDb.games.get(gameId);
  if (!game) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
      404
    );
  }

  const updatedGame = {
    ...game,
    currentPeriod: period,
    updatedAt: new Date().toISOString(),
  };

  mockDb.games.set(gameId, updatedGame);

  return c.json({ success: true, game: updatedGame });
});
