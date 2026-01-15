import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  varchar,
  decimal,
  jsonb,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS & AUTH
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// ORGANIZATIONS & TEAMS
// ============================================

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable(
  'teams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    sport: varchar('sport', { length: 50 }).notNull(),
    logoUrl: text('logo_url'),
    primaryColor: varchar('primary_color', { length: 7 }),
    secondaryColor: varchar('secondary_color', { length: 7 }),
    organizationId: uuid('organization_id').references(() => organizations.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index('teams_org_idx').on(table.organizationId),
    sportIdx: index('teams_sport_idx').on(table.sport),
  })
);

export const seasons = pgTable('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// TEAM MEMBERS & PLAYERS
// ============================================

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull().default('fan'),
    jerseyNumber: varchar('jersey_number', { length: 10 }),
    position: varchar('position', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    teamUserIdx: index('team_members_team_user_idx').on(table.teamId, table.userId),
  })
);

export const players = pgTable(
  'players',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    jerseyNumber: varchar('jersey_number', { length: 10 }),
    position: varchar('position', { length: 50 }),
    dateOfBirth: timestamp('date_of_birth'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    teamIdx: index('players_team_idx').on(table.teamId),
  })
);

export const playerParents = pgTable(
  'player_parents',
  {
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playerId, table.userId] }),
  })
);

// ============================================
// EVENTS & SCHEDULING
// ============================================

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    seasonId: uuid('season_id').references(() => seasons.id),
    type: varchar('type', { length: 50 }).notNull().default('game'),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    location: varchar('location', { length: 255 }),
    locationAddress: text('location_address'),
    locationLat: decimal('location_lat', { precision: 10, scale: 7 }),
    locationLng: decimal('location_lng', { precision: 10, scale: 7 }),
    opponentName: varchar('opponent_name', { length: 255 }),
    isHome: boolean('is_home').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    teamIdx: index('events_team_idx').on(table.teamId),
    startTimeIdx: index('events_start_time_idx').on(table.startTime),
  })
);

export const rsvps = pgTable(
  'rsvps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id').references(() => players.id),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    eventUserIdx: index('rsvps_event_user_idx').on(table.eventId, table.userId),
  })
);

// ============================================
// GAMES & SCOREKEEPING
// ============================================

export const games = pgTable(
  'games',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).notNull().default('scheduled'),
    homeScore: integer('home_score').notNull().default(0),
    awayScore: integer('away_score').notNull().default(0),
    isHome: boolean('is_home').notNull().default(true),
    currentPeriod: integer('current_period').default(1),
    periodScores: jsonb('period_scores').$type<number[][]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index('games_event_idx').on(table.eventId),
    teamIdx: index('games_team_idx').on(table.teamId),
    statusIdx: index('games_status_idx').on(table.status),
  })
);

export const gameEvents = pgTable(
  'game_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id').references(() => players.id),
    type: varchar('type', { length: 50 }).notNull(),
    description: text('description'),
    period: integer('period'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    data: jsonb('data'),
  },
  (table) => ({
    gameIdx: index('game_events_game_idx').on(table.gameId),
  })
);

export const playerGameStats = pgTable(
  'player_game_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    stats: jsonb('stats').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    gamePlayerIdx: index('player_game_stats_game_player_idx').on(table.gameId, table.playerId),
  })
);

// ============================================
// MESSAGING
// ============================================

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    replyToId: uuid('reply_to_id'),
    isAnnouncement: boolean('is_announcement').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    teamIdx: index('messages_team_idx').on(table.teamId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  })
);

// ============================================
// MEDIA
// ============================================

export const media = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    uploaderId: uuid('uploader_id')
      .notNull()
      .references(() => users.id),
    gameId: uuid('game_id').references(() => games.id),
    type: varchar('type', { length: 20 }).notNull(), // 'photo', 'video'
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    duration: integer('duration'), // for videos, in seconds
    fileSize: integer('file_size'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    teamIdx: index('media_team_idx').on(table.teamId),
    gameIdx: index('media_game_idx').on(table.gameId),
  })
);

// ============================================
// INVITATIONS
// ============================================

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('fan'),
  code: varchar('code', { length: 50 }).notNull().unique(),
  usedBy: uuid('used_by').references(() => users.id),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  sessions: many(sessions),
  messages: many(messages),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  members: many(teamMembers),
  players: many(players),
  events: many(events),
  games: many(games),
  messages: many(messages),
  seasons: many(seasons),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  gameStats: many(playerGameStats),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  team: one(teams, {
    fields: [events.teamId],
    references: [teams.id],
  }),
  season: one(seasons, {
    fields: [events.seasonId],
    references: [seasons.id],
  }),
  rsvps: many(rsvps),
  game: one(games),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  event: one(events, {
    fields: [games.eventId],
    references: [events.id],
  }),
  team: one(teams, {
    fields: [games.teamId],
    references: [teams.id],
  }),
  gameEvents: many(gameEvents),
  playerStats: many(playerGameStats),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  team: one(teams, {
    fields: [messages.teamId],
    references: [teams.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
