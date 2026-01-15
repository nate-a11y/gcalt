// Stats Aggregation Utilities

import { Sport, PlayerGameStats, PlayerSeasonStats, LeaderboardEntry } from './types';
import { aggregateBaseballBattingStats, aggregateBaseballPitchingStats } from './baseball';
import { aggregateBasketballStats } from './basketball';
import { aggregateSoccerStats } from './soccer';
import { aggregateFootballStats } from './football';
import { aggregateVolleyballStats } from './volleyball';

// ===========================================
// GENERIC AGGREGATION
// ===========================================

export function aggregatePlayerStats(sport: Sport, gameStats: PlayerGameStats[]): Record<string, number> {
  switch (sport) {
    case 'baseball':
    case 'softball':
      // Combine batting and pitching stats
      const batting = aggregateBaseballBattingStats(gameStats);
      const pitching = aggregateBaseballPitchingStats(gameStats);
      return { ...batting, ...pitching };
    case 'basketball':
      return aggregateBasketballStats(gameStats);
    case 'soccer':
      return aggregateSoccerStats(gameStats);
    case 'football':
      return aggregateFootballStats(gameStats);
    case 'volleyball':
      return aggregateVolleyballStats(gameStats);
    default:
      // Generic aggregation for unsupported sports
      return genericAggregate(gameStats);
  }
}

function genericAggregate(gameStats: PlayerGameStats[]): Record<string, number> {
  if (gameStats.length === 0) return {};

  const totals: Record<string, number> = {};

  for (const game of gameStats) {
    for (const [key, value] of Object.entries(game.stats)) {
      if (typeof value === 'number') {
        totals[key] = (totals[key] || 0) + value;
      }
    }
  }

  return totals;
}

// ===========================================
// SEASON STATS CALCULATION
// ===========================================

export function calculateSeasonStats(
  playerId: string,
  seasonId: string,
  teamId: string,
  sport: Sport,
  gameStats: PlayerGameStats[]
): PlayerSeasonStats {
  const aggregated = aggregatePlayerStats(sport, gameStats);

  return {
    playerId,
    seasonId,
    teamId,
    sport,
    gamesPlayed: gameStats.length,
    stats: aggregated,
    calculatedStats: aggregated, // In real implementation, separate counting vs calculated
  };
}

// ===========================================
// LEADERBOARDS
// ===========================================

export function generateLeaderboard(
  players: { id: string; name: string; teamId: string; teamName: string; stats: Record<string, number> }[],
  statKey: string,
  limit: number = 10,
  ascending: boolean = false
): LeaderboardEntry[] {
  const sorted = [...players]
    .filter(p => p.stats[statKey] !== undefined && p.stats[statKey] !== null)
    .sort((a, b) => {
      const diff = (b.stats[statKey] || 0) - (a.stats[statKey] || 0);
      return ascending ? -diff : diff;
    })
    .slice(0, limit);

  return sorted.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    teamId: player.teamId,
    teamName: player.teamName,
    statKey,
    value: player.stats[statKey] || 0,
    rank: index + 1,
  }));
}

// ===========================================
// TEAM STATS
// ===========================================

export function aggregateTeamStats(
  sport: Sport,
  playerStats: PlayerSeasonStats[]
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const player of playerStats) {
    for (const [key, value] of Object.entries(player.stats)) {
      if (typeof value === 'number') {
        totals[key] = (totals[key] || 0) + value;
      }
    }
  }

  return totals;
}

// ===========================================
// RECORD TRACKING
// ===========================================

export interface SeasonRecord {
  playerId: string;
  playerName: string;
  teamId: string;
  statKey: string;
  value: number;
  gameId?: string;
  date: Date;
  recordType: 'season_high' | 'career_high' | 'team_record' | 'league_record';
}

export function checkForRecords(
  playerId: string,
  playerName: string,
  teamId: string,
  gameId: string,
  currentStats: Record<string, number>,
  previousBests: Record<string, number>,
  recordableStats: string[]
): SeasonRecord[] {
  const newRecords: SeasonRecord[] = [];

  for (const statKey of recordableStats) {
    const current = currentStats[statKey] || 0;
    const previous = previousBests[statKey] || 0;

    if (current > previous) {
      newRecords.push({
        playerId,
        playerName,
        teamId,
        statKey,
        value: current,
        gameId,
        date: new Date(),
        recordType: 'season_high',
      });
    }
  }

  return newRecords;
}

// ===========================================
// STAT COMPARISON
// ===========================================

export interface StatComparison {
  statKey: string;
  playerValue: number;
  teamAverage: number;
  leagueAverage: number;
  percentileRank: number;
}

export function compareToAverages(
  playerStats: Record<string, number>,
  teamAverages: Record<string, number>,
  leagueAverages: Record<string, number>,
  statKeys: string[]
): StatComparison[] {
  return statKeys.map(key => ({
    statKey: key,
    playerValue: playerStats[key] || 0,
    teamAverage: teamAverages[key] || 0,
    leagueAverage: leagueAverages[key] || 0,
    percentileRank: calculatePercentile(playerStats[key] || 0, leagueAverages[key] || 0),
  }));
}

function calculatePercentile(value: number, average: number): number {
  if (average === 0) return 50;
  // Simplified percentile - in reality would use actual distribution
  const ratio = value / average;
  return Math.min(99, Math.max(1, Math.round(50 + (ratio - 1) * 25)));
}

// ===========================================
// TRENDING STATS
// ===========================================

export interface TrendData {
  statKey: string;
  values: { gameDate: Date; value: number }[];
  trend: 'up' | 'down' | 'stable';
  recentAverage: number;
  seasonAverage: number;
}

export function calculateTrend(
  gameStats: PlayerGameStats[],
  statKey: string,
  recentGames: number = 5
): TrendData {
  const values = gameStats
    .map(g => ({
      gameDate: g.createdAt,
      value: g.stats[statKey] || 0,
    }))
    .sort((a, b) => a.gameDate.getTime() - b.gameDate.getTime());

  const seasonAverage = values.length > 0
    ? values.reduce((sum, v) => sum + v.value, 0) / values.length
    : 0;

  const recentValues = values.slice(-recentGames);
  const recentAverage = recentValues.length > 0
    ? recentValues.reduce((sum, v) => sum + v.value, 0) / recentValues.length
    : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recentAverage > seasonAverage * 1.1) trend = 'up';
  else if (recentAverage < seasonAverage * 0.9) trend = 'down';

  return {
    statKey,
    values,
    trend,
    recentAverage,
    seasonAverage,
  };
}
