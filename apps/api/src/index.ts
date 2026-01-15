import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { teamsRoutes } from './routes/teams';
import { playersRoutes } from './routes/players';
import { eventsRoutes } from './routes/events';
import { gamesRoutes } from './routes/games';
import { messagesRoutes } from './routes/messages';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Sideline API',
    version: '0.0.1',
    status: 'healthy',
  });
});

// Routes
app.route('/auth', authRoutes);
app.route('/teams', teamsRoutes);
app.route('/teams/:teamId/players', playersRoutes);
app.route('/teams/:teamId/events', eventsRoutes);
app.route('/teams/:teamId/games', gamesRoutes);
app.route('/teams/:teamId/messages', messagesRoutes);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Internal server error',
      },
    },
    500
  );
});

// Start server
const port = parseInt(process.env.PORT || '3001');
console.log(`Sideline API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
