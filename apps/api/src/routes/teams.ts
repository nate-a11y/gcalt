import { Hono } from 'hono';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { authMiddleware } from '../lib/auth';
import { mockDb } from '../lib/db';

export const teamsRoutes = new Hono();

// Apply auth middleware to all routes
teamsRoutes.use('*', authMiddleware);

const createTeamSchema = z.object({
  name: z.string().min(1),
  sport: z.string().min(1),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

const updateTeamSchema = createTeamSchema.partial();

// List user's teams
teamsRoutes.get('/', async (c) => {
  const userId = c.get('userId');

  // Get all teams where user is a member
  const memberTeamIds = Array.from(mockDb.teamMembers.values())
    .filter((m) => m.userId === userId)
    .map((m) => m.teamId);

  const teams = Array.from(mockDb.teams.values())
    .filter((t) => memberTeamIds.includes(t.id))
    .map((t) => {
      const playerCount = Array.from(mockDb.players.values()).filter(
        (p) => p.teamId === t.id
      ).length;
      return { ...t, playerCount };
    });

  return c.json({ success: true, teams });
});

// Get single team
teamsRoutes.get('/:id', async (c) => {
  const teamId = c.req.param('id');
  const userId = c.get('userId');

  const team = mockDb.teams.get(teamId);
  if (!team) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } },
      404
    );
  }

  // Check if user is a member
  const member = Array.from(mockDb.teamMembers.values()).find(
    (m) => m.teamId === teamId && m.userId === userId
  );
  if (!member) {
    return c.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Not a team member' } },
      403
    );
  }

  const playerCount = Array.from(mockDb.players.values()).filter(
    (p) => p.teamId === teamId
  ).length;

  return c.json({ success: true, team: { ...team, playerCount } });
});

// Create team
teamsRoutes.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const data = createTeamSchema.parse(body);

    const team = {
      id: nanoid(),
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.teams.set(team.id, team);

    // Add creator as owner
    const membership = {
      id: nanoid(),
      teamId: team.id,
      userId,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    mockDb.teamMembers.set(membership.id, membership);

    return c.json({ success: true, team }, 201);
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

// Update team
teamsRoutes.patch('/:id', async (c) => {
  try {
    const teamId = c.req.param('id');
    const userId = c.get('userId');
    const body = await c.req.json();
    const data = updateTeamSchema.parse(body);

    const team = mockDb.teams.get(teamId);
    if (!team) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } },
        404
      );
    }

    // Check if user is owner/admin
    const member = Array.from(mockDb.teamMembers.values()).find(
      (m) => m.teamId === teamId && m.userId === userId && ['owner', 'admin'].includes(m.role)
    );
    if (!member) {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } },
        403
      );
    }

    const updatedTeam = {
      ...team,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockDb.teams.set(teamId, updatedTeam);

    return c.json({ success: true, team: updatedTeam });
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

// Delete team
teamsRoutes.delete('/:id', async (c) => {
  const teamId = c.req.param('id');
  const userId = c.get('userId');

  const team = mockDb.teams.get(teamId);
  if (!team) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } },
      404
    );
  }

  // Check if user is owner
  const member = Array.from(mockDb.teamMembers.values()).find(
    (m) => m.teamId === teamId && m.userId === userId && m.role === 'owner'
  );
  if (!member) {
    return c.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Only owner can delete team' } },
      403
    );
  }

  mockDb.teams.delete(teamId);

  // Clean up related data
  for (const [id, m] of mockDb.teamMembers) {
    if (m.teamId === teamId) mockDb.teamMembers.delete(id);
  }
  for (const [id, p] of mockDb.players) {
    if (p.teamId === teamId) mockDb.players.delete(id);
  }
  for (const [id, e] of mockDb.events) {
    if (e.teamId === teamId) mockDb.events.delete(id);
  }
  for (const [id, g] of mockDb.games) {
    if (g.teamId === teamId) mockDb.games.delete(id);
  }
  for (const [id, m] of mockDb.messages) {
    if (m.teamId === teamId) mockDb.messages.delete(id);
  }

  return c.json({ success: true });
});
