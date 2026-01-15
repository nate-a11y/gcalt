// Core types for stats engine

export type Sport = 'baseball' | 'softball' | 'basketball' | 'soccer' | 'football' | 'volleyball' | 'lacrosse' | 'hockey';

export interface PlayerGameStats {
  playerId: string;
  gameId: string;
  teamId: string;
  sport: Sport;
  stats: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerSeasonStats {
  playerId: string;
  seasonId: string;
  teamId: string;
  sport: Sport;
  gamesPlayed: number;
  stats: Record<string, number>;
  calculatedStats: Record<string, number>;
}

export interface TeamGameStats {
  teamId: string;
  gameId: string;
  sport: Sport;
  stats: Record<string, number>;
}

export interface TeamSeasonStats {
  teamId: string;
  seasonId: string;
  sport: Sport;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  stats: Record<string, number>;
  calculatedStats: Record<string, number>;
}

export interface StatDefinition {
  key: string;
  name: string;
  abbreviation: string;
  description: string;
  type: 'counting' | 'calculated' | 'percentage' | 'average';
  precision?: number;
  formula?: string;
  higherIsBetter: boolean;
}

export interface GameEvent {
  id: string;
  gameId: string;
  teamId: string;
  playerId?: string;
  type: string;
  value?: number;
  description?: string;
  timestamp: Date;
  period?: number;
  metadata?: Record<string, any>;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  statKey: string;
  value: number;
  rank: number;
}
