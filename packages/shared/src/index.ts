// Sideline Shared Types & Utilities

// ============================================
// ENUMS
// ============================================

export const SPORTS = [
  'baseball',
  'softball',
  'basketball',
  'soccer',
  'football',
  'volleyball',
  'lacrosse',
  'hockey',
  'field_hockey',
  'swimming',
  'track_field',
  'wrestling',
  'tennis',
  'golf',
  'water_polo',
  'rugby',
] as const;

export type Sport = (typeof SPORTS)[number];

export const TEAM_ROLES = ['owner', 'admin', 'coach', 'manager', 'player', 'parent', 'fan'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const EVENT_TYPES = ['game', 'practice', 'meeting', 'other'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const RSVP_STATUS = ['yes', 'no', 'maybe', 'pending'] as const;
export type RsvpStatus = (typeof RSVP_STATUS)[number];

export const GAME_STATUS = ['scheduled', 'in_progress', 'final', 'postponed', 'cancelled'] as const;
export type GameStatus = (typeof GAME_STATUS)[number];

// ============================================
// CORE TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  sport: Sport;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  organizationId?: string;
  seasonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  jerseyNumber?: string;
  position?: string;
  createdAt: Date;
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  position?: string;
  dateOfBirth?: Date;
  parentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  opponentId?: string;
  opponentName?: string;
  isHome?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  playerId?: string;
  status: RsvpStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  eventId: string;
  teamId: string;
  opponentName: string;
  status: GameStatus;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  innings?: number; // for baseball/softball
  quarters?: number; // for basketball
  halves?: number; // for soccer
  currentPeriod?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  teamId: string;
  senderId: string;
  content: string;
  replyToId?: string;
  isAnnouncement: boolean;
  createdAt: Date;
}

export interface Season {
  id: string;
  teamId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

// ============================================
// STATS TYPES
// ============================================

export interface BaseballStats {
  // Batting
  atBats: number;
  hits: number;
  runs: number;
  rbis: number;
  walks: number;
  strikeouts: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  stolenBases: number;
  // Pitching
  inningsPitched: number;
  earnedRuns: number;
  strikeoutsP: number;
  walksP: number;
  hitsAllowed: number;
  wins: number;
  losses: number;
  saves: number;
}

export interface BasketballStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgMade: number;
  fgAttempted: number;
  threePtMade: number;
  threePtAttempted: number;
  ftMade: number;
  ftAttempted: number;
  minutesPlayed: number;
}

export interface SoccerStats {
  goals: number;
  assists: number;
  shots: number;
  shotsOnGoal: number;
  saves: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

export type PlayerStats = BaseballStats | BasketballStats | SoccerStats;

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatScore(homeScore: number, awayScore: number, isHome: boolean): string {
  if (isHome) {
    return `${homeScore} - ${awayScore}`;
  }
  return `${awayScore} - ${homeScore}`;
}

export function getGameResult(homeScore: number, awayScore: number, isHome: boolean): 'win' | 'loss' | 'tie' {
  const ourScore = isHome ? homeScore : awayScore;
  const theirScore = isHome ? awayScore : homeScore;

  if (ourScore > theirScore) return 'win';
  if (ourScore < theirScore) return 'loss';
  return 'tie';
}

export function calculateBattingAverage(hits: number, atBats: number): string {
  if (atBats === 0) return '.000';
  return (hits / atBats).toFixed(3).replace(/^0/, '');
}

export function calculateERA(earnedRuns: number, inningsPitched: number): string {
  if (inningsPitched === 0) return '0.00';
  return ((earnedRuns * 9) / inningsPitched).toFixed(2);
}

export function calculateShootingPercentage(made: number, attempted: number): string {
  if (attempted === 0) return '0.0%';
  return ((made / attempted) * 100).toFixed(1) + '%';
}
