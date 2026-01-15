// Volleyball Statistics Engine

import { StatDefinition, PlayerGameStats } from './types';

// ===========================================
// STAT DEFINITIONS
// ===========================================

export const VOLLEYBALL_STATS: StatDefinition[] = [
  // Attacking
  { key: 'kills', name: 'Kills', abbreviation: 'K', description: 'Attack kills', type: 'counting', higherIsBetter: true },
  { key: 'attack_errors', name: 'Attack Errors', abbreviation: 'E', description: 'Attack errors', type: 'counting', higherIsBetter: false },
  { key: 'attack_attempts', name: 'Attack Attempts', abbreviation: 'TA', description: 'Total attacks', type: 'counting', higherIsBetter: true },

  // Serving
  { key: 'aces', name: 'Aces', abbreviation: 'SA', description: 'Service aces', type: 'counting', higherIsBetter: true },
  { key: 'serve_errors', name: 'Serve Errors', abbreviation: 'SE', description: 'Service errors', type: 'counting', higherIsBetter: false },
  { key: 'serves', name: 'Total Serves', abbreviation: 'S', description: 'Total serves', type: 'counting', higherIsBetter: true },

  // Blocking
  { key: 'blocks_solo', name: 'Solo Blocks', abbreviation: 'BS', description: 'Solo blocks', type: 'counting', higherIsBetter: true },
  { key: 'blocks_assist', name: 'Block Assists', abbreviation: 'BA', description: 'Block assists', type: 'counting', higherIsBetter: true },
  { key: 'block_errors', name: 'Block Errors', abbreviation: 'BE', description: 'Blocking errors', type: 'counting', higherIsBetter: false },

  // Setting
  { key: 'assists', name: 'Assists', abbreviation: 'AST', description: 'Setting assists', type: 'counting', higherIsBetter: true },
  { key: 'ball_handling_errors', name: 'Ball Handling Errors', abbreviation: 'BHE', description: 'Ball handling errors', type: 'counting', higherIsBetter: false },

  // Passing/Defense
  { key: 'digs', name: 'Digs', abbreviation: 'DIG', description: 'Digs', type: 'counting', higherIsBetter: true },
  { key: 'reception_errors', name: 'Reception Errors', abbreviation: 'RE', description: 'Reception errors', type: 'counting', higherIsBetter: false },
  { key: 'receptions', name: 'Receptions', abbreviation: 'REC', description: 'Total receptions', type: 'counting', higherIsBetter: true },

  // Points
  { key: 'points', name: 'Points', abbreviation: 'PTS', description: 'Total points scored', type: 'calculated', formula: 'kills + aces + blocks_solo + (blocks_assist * 0.5)', higherIsBetter: true },

  // Sets/Games
  { key: 'sets_played', name: 'Sets Played', abbreviation: 'SP', description: 'Sets played', type: 'counting', higherIsBetter: true },

  // Calculated stats
  { key: 'hitting_pct', name: 'Hitting %', abbreviation: 'PCT', description: 'Hitting percentage', type: 'percentage', precision: 3, formula: '(kills - attack_errors) / attack_attempts', higherIsBetter: true },
  { key: 'blocks_total', name: 'Total Blocks', abbreviation: 'TB', description: 'Total blocks', type: 'calculated', formula: 'blocks_solo + (blocks_assist * 0.5)', higherIsBetter: true },
  { key: 'kills_per_set', name: 'Kills/Set', abbreviation: 'K/S', description: 'Kills per set', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'digs_per_set', name: 'Digs/Set', abbreviation: 'D/S', description: 'Digs per set', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'assists_per_set', name: 'Assists/Set', abbreviation: 'A/S', description: 'Assists per set', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'blocks_per_set', name: 'Blocks/Set', abbreviation: 'B/S', description: 'Blocks per set', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'aces_per_set', name: 'Aces/Set', abbreviation: 'SA/S', description: 'Aces per set', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'serve_pct', name: 'Serve %', abbreviation: 'S%', description: 'Serving percentage', type: 'percentage', precision: 1, formula: '(serves - serve_errors) / serves * 100', higherIsBetter: true },
  { key: 'pass_rating', name: 'Pass Rating', abbreviation: 'PR', description: 'Passing rating (0-3 scale)', type: 'calculated', precision: 2, higherIsBetter: true },
];

// ===========================================
// CALCULATION FUNCTIONS
// ===========================================

export function calculateHittingPct(kills: number, errors: number, attempts: number): number {
  if (attempts === 0) return 0;
  return (kills - errors) / attempts;
}

export function calculateTotalBlocks(soloBlocks: number, blockAssists: number): number {
  return soloBlocks + (blockAssists * 0.5);
}

export function calculatePoints(kills: number, aces: number, soloBlocks: number, blockAssists: number): number {
  return kills + aces + soloBlocks + (blockAssists * 0.5);
}

export function calculateServePct(serves: number, errors: number): number {
  if (serves === 0) return 0;
  return ((serves - errors) / serves) * 100;
}

// ===========================================
// FORMATTING
// ===========================================

export function formatHittingPct(pct: number): string {
  const formatted = pct.toFixed(3);
  if (pct >= 0) return formatted.replace(/^0/, '');
  return formatted.replace(/^-0/, '-');
}

// ===========================================
// AGGREGATION
// ===========================================

export function aggregateVolleyballStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {
    kills: 0, attack_errors: 0, attack_attempts: 0,
    aces: 0, serve_errors: 0, serves: 0,
    blocks_solo: 0, blocks_assist: 0, block_errors: 0,
    assists: 0, ball_handling_errors: 0,
    digs: 0, reception_errors: 0, receptions: 0,
    sets_played: 0,
  };

  for (const game of gameStats) {
    for (const key of Object.keys(totals)) {
      totals[key] += game.stats[key] || 0;
    }
  }

  // Calculate derived stats
  totals.hitting_pct = calculateHittingPct(totals.kills, totals.attack_errors, totals.attack_attempts);
  totals.blocks_total = calculateTotalBlocks(totals.blocks_solo, totals.blocks_assist);
  totals.points = calculatePoints(totals.kills, totals.aces, totals.blocks_solo, totals.blocks_assist);
  totals.serve_pct = calculateServePct(totals.serves, totals.serve_errors);

  // Per-set averages
  if (totals.sets_played > 0) {
    totals.kills_per_set = totals.kills / totals.sets_played;
    totals.digs_per_set = totals.digs / totals.sets_played;
    totals.assists_per_set = totals.assists / totals.sets_played;
    totals.blocks_per_set = totals.blocks_total / totals.sets_played;
    totals.aces_per_set = totals.aces / totals.sets_played;
  }

  return totals;
}

// ===========================================
// BOX SCORE
// ===========================================

export interface VolleyballBoxScore {
  players: {
    playerId: string;
    playerName: string;
    position: string;
    sets: number;
    kills: number;
    errors: number;
    attempts: number;
    pct: number;
    assists: number;
    aces: number;
    serveErrors: number;
    digs: number;
    blocks: number;
    points: number;
  }[];
  teamTotals: {
    kills: number;
    errors: number;
    attempts: number;
    pct: number;
    assists: number;
    aces: number;
    serveErrors: number;
    digs: number;
    blocks: number;
    points: number;
  };
  setScores: { home: number; away: number }[];
}

export function generateVolleyballBoxScore(
  playerStats: (PlayerGameStats & { playerName: string; position: string })[],
  setScores: { home: number; away: number }[]
): VolleyballBoxScore {
  const players = playerStats.map(p => {
    const blocks = calculateTotalBlocks(p.stats.blocks_solo || 0, p.stats.blocks_assist || 0);
    return {
      playerId: p.playerId,
      playerName: p.playerName,
      position: p.position,
      sets: p.stats.sets_played || 0,
      kills: p.stats.kills || 0,
      errors: p.stats.attack_errors || 0,
      attempts: p.stats.attack_attempts || 0,
      pct: calculateHittingPct(p.stats.kills || 0, p.stats.attack_errors || 0, p.stats.attack_attempts || 0),
      assists: p.stats.assists || 0,
      aces: p.stats.aces || 0,
      serveErrors: p.stats.serve_errors || 0,
      digs: p.stats.digs || 0,
      blocks,
      points: calculatePoints(p.stats.kills || 0, p.stats.aces || 0, p.stats.blocks_solo || 0, p.stats.blocks_assist || 0),
    };
  });

  // Sort by kills descending
  players.sort((a, b) => b.kills - a.kills);

  const teamTotals = {
    kills: players.reduce((sum, p) => sum + p.kills, 0),
    errors: players.reduce((sum, p) => sum + p.errors, 0),
    attempts: players.reduce((sum, p) => sum + p.attempts, 0),
    pct: 0,
    assists: players.reduce((sum, p) => sum + p.assists, 0),
    aces: players.reduce((sum, p) => sum + p.aces, 0),
    serveErrors: players.reduce((sum, p) => sum + p.serveErrors, 0),
    digs: players.reduce((sum, p) => sum + p.digs, 0),
    blocks: players.reduce((sum, p) => sum + p.blocks, 0),
    points: players.reduce((sum, p) => sum + p.points, 0),
  };

  teamTotals.pct = calculateHittingPct(teamTotals.kills, teamTotals.errors, teamTotals.attempts);

  return { players, teamTotals, setScores };
}
