import { createDb } from '@sideline/db';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL not set, using mock database');
}

export const db = databaseUrl ? createDb(databaseUrl) : null;

// Mock data store for development without a database
export const mockDb = {
  users: new Map<string, any>(),
  teams: new Map<string, any>(),
  players: new Map<string, any>(),
  events: new Map<string, any>(),
  games: new Map<string, any>(),
  messages: new Map<string, any>(),
  teamMembers: new Map<string, any>(),
};
