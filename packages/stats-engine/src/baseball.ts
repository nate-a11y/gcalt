// Baseball & Softball Statistics Engine

import { StatDefinition, PlayerGameStats, PlayerSeasonStats } from './types';

// ===========================================
// STAT DEFINITIONS
// ===========================================

export const BASEBALL_BATTING_STATS: StatDefinition[] = [
  // Counting stats
  { key: 'ab', name: 'At Bats', abbreviation: 'AB', description: 'Official at bats', type: 'counting', higherIsBetter: true },
  { key: 'r', name: 'Runs', abbreviation: 'R', description: 'Runs scored', type: 'counting', higherIsBetter: true },
  { key: 'h', name: 'Hits', abbreviation: 'H', description: 'Base hits', type: 'counting', higherIsBetter: true },
  { key: 'single', name: 'Singles', abbreviation: '1B', description: 'Single base hits', type: 'counting', higherIsBetter: true },
  { key: 'double', name: 'Doubles', abbreviation: '2B', description: 'Two base hits', type: 'counting', higherIsBetter: true },
  { key: 'triple', name: 'Triples', abbreviation: '3B', description: 'Three base hits', type: 'counting', higherIsBetter: true },
  { key: 'hr', name: 'Home Runs', abbreviation: 'HR', description: 'Home runs', type: 'counting', higherIsBetter: true },
  { key: 'rbi', name: 'Runs Batted In', abbreviation: 'RBI', description: 'Runs batted in', type: 'counting', higherIsBetter: true },
  { key: 'bb', name: 'Walks', abbreviation: 'BB', description: 'Base on balls', type: 'counting', higherIsBetter: true },
  { key: 'so', name: 'Strikeouts', abbreviation: 'SO', description: 'Strikeouts', type: 'counting', higherIsBetter: false },
  { key: 'hbp', name: 'Hit By Pitch', abbreviation: 'HBP', description: 'Hit by pitch', type: 'counting', higherIsBetter: true },
  { key: 'sb', name: 'Stolen Bases', abbreviation: 'SB', description: 'Stolen bases', type: 'counting', higherIsBetter: true },
  { key: 'cs', name: 'Caught Stealing', abbreviation: 'CS', description: 'Caught stealing', type: 'counting', higherIsBetter: false },
  { key: 'sac', name: 'Sacrifice Hits', abbreviation: 'SAC', description: 'Sacrifice bunts and flies', type: 'counting', higherIsBetter: true },

  // Calculated stats
  { key: 'avg', name: 'Batting Average', abbreviation: 'AVG', description: 'Hits divided by at bats', type: 'calculated', precision: 3, formula: 'h / ab', higherIsBetter: true },
  { key: 'obp', name: 'On-Base Percentage', abbreviation: 'OBP', description: 'Times reached base divided by plate appearances', type: 'calculated', precision: 3, formula: '(h + bb + hbp) / (ab + bb + hbp + sac)', higherIsBetter: true },
  { key: 'slg', name: 'Slugging Percentage', abbreviation: 'SLG', description: 'Total bases divided by at bats', type: 'calculated', precision: 3, formula: '(single + 2*double + 3*triple + 4*hr) / ab', higherIsBetter: true },
  { key: 'ops', name: 'OPS', abbreviation: 'OPS', description: 'On-base plus slugging', type: 'calculated', precision: 3, formula: 'obp + slg', higherIsBetter: true },
  { key: 'tb', name: 'Total Bases', abbreviation: 'TB', description: 'Total bases from hits', type: 'calculated', formula: 'single + 2*double + 3*triple + 4*hr', higherIsBetter: true },
];

export const BASEBALL_PITCHING_STATS: StatDefinition[] = [
  // Counting stats
  { key: 'ip', name: 'Innings Pitched', abbreviation: 'IP', description: 'Innings pitched', type: 'counting', precision: 1, higherIsBetter: true },
  { key: 'w', name: 'Wins', abbreviation: 'W', description: 'Pitcher wins', type: 'counting', higherIsBetter: true },
  { key: 'l', name: 'Losses', abbreviation: 'L', description: 'Pitcher losses', type: 'counting', higherIsBetter: false },
  { key: 'sv', name: 'Saves', abbreviation: 'SV', description: 'Saves', type: 'counting', higherIsBetter: true },
  { key: 'h_allowed', name: 'Hits Allowed', abbreviation: 'H', description: 'Hits allowed', type: 'counting', higherIsBetter: false },
  { key: 'r_allowed', name: 'Runs Allowed', abbreviation: 'R', description: 'Runs allowed', type: 'counting', higherIsBetter: false },
  { key: 'er', name: 'Earned Runs', abbreviation: 'ER', description: 'Earned runs allowed', type: 'counting', higherIsBetter: false },
  { key: 'bb_allowed', name: 'Walks Allowed', abbreviation: 'BB', description: 'Walks allowed', type: 'counting', higherIsBetter: false },
  { key: 'so_pitching', name: 'Strikeouts', abbreviation: 'K', description: 'Strikeouts by pitcher', type: 'counting', higherIsBetter: true },
  { key: 'pitches', name: 'Pitches', abbreviation: 'P', description: 'Total pitches thrown', type: 'counting', higherIsBetter: false },
  { key: 'strikes', name: 'Strikes', abbreviation: 'S', description: 'Strikes thrown', type: 'counting', higherIsBetter: true },
  { key: 'balls', name: 'Balls', abbreviation: 'B', description: 'Balls thrown', type: 'counting', higherIsBetter: false },

  // Calculated stats
  { key: 'era', name: 'Earned Run Average', abbreviation: 'ERA', description: 'Earned runs per 9 innings', type: 'calculated', precision: 2, formula: '(er * 9) / ip', higherIsBetter: false },
  { key: 'whip', name: 'WHIP', abbreviation: 'WHIP', description: 'Walks and hits per inning pitched', type: 'calculated', precision: 2, formula: '(bb_allowed + h_allowed) / ip', higherIsBetter: false },
  { key: 'k9', name: 'K/9', abbreviation: 'K/9', description: 'Strikeouts per 9 innings', type: 'calculated', precision: 1, formula: '(so_pitching * 9) / ip', higherIsBetter: true },
  { key: 'bb9', name: 'BB/9', abbreviation: 'BB/9', description: 'Walks per 9 innings', type: 'calculated', precision: 1, formula: '(bb_allowed * 9) / ip', higherIsBetter: false },
  { key: 'strike_pct', name: 'Strike %', abbreviation: 'S%', description: 'Percentage of pitches that are strikes', type: 'percentage', precision: 1, formula: 'strikes / pitches * 100', higherIsBetter: true },
];

export const BASEBALL_FIELDING_STATS: StatDefinition[] = [
  { key: 'po', name: 'Putouts', abbreviation: 'PO', description: 'Putouts recorded', type: 'counting', higherIsBetter: true },
  { key: 'a', name: 'Assists', abbreviation: 'A', description: 'Assists recorded', type: 'counting', higherIsBetter: true },
  { key: 'e', name: 'Errors', abbreviation: 'E', description: 'Errors committed', type: 'counting', higherIsBetter: false },
  { key: 'dp', name: 'Double Plays', abbreviation: 'DP', description: 'Double plays turned', type: 'counting', higherIsBetter: true },
  { key: 'fpct', name: 'Fielding Percentage', abbreviation: 'FPCT', description: 'Fielding percentage', type: 'calculated', precision: 3, formula: '(po + a) / (po + a + e)', higherIsBetter: true },
];

// ===========================================
// CALCULATION FUNCTIONS
// ===========================================

export function calculateBattingAverage(hits: number, atBats: number): number {
  if (atBats === 0) return 0;
  return hits / atBats;
}

export function calculateOBP(hits: number, walks: number, hbp: number, atBats: number, sac: number): number {
  const pa = atBats + walks + hbp + sac;
  if (pa === 0) return 0;
  return (hits + walks + hbp) / pa;
}

export function calculateSLG(singles: number, doubles: number, triples: number, homeRuns: number, atBats: number): number {
  if (atBats === 0) return 0;
  const totalBases = singles + (2 * doubles) + (3 * triples) + (4 * homeRuns);
  return totalBases / atBats;
}

export function calculateOPS(obp: number, slg: number): number {
  return obp + slg;
}

export function calculateERA(earnedRuns: number, inningsPitched: number): number {
  if (inningsPitched === 0) return 0;
  return (earnedRuns * 9) / inningsPitched;
}

export function calculateWHIP(walks: number, hits: number, inningsPitched: number): number {
  if (inningsPitched === 0) return 0;
  return (walks + hits) / inningsPitched;
}

export function calculateFieldingPct(putouts: number, assists: number, errors: number): number {
  const totalChances = putouts + assists + errors;
  if (totalChances === 0) return 0;
  return (putouts + assists) / totalChances;
}

// ===========================================
// FORMATTING FUNCTIONS
// ===========================================

export function formatBattingAverage(avg: number): string {
  if (avg >= 1) return '1.000';
  return avg.toFixed(3).replace(/^0/, '');
}

export function formatERA(era: number): string {
  return era.toFixed(2);
}

export function formatInningsPitched(outs: number): string {
  const fullInnings = Math.floor(outs / 3);
  const partialOuts = outs % 3;
  if (partialOuts === 0) return fullInnings.toString();
  return `${fullInnings}.${partialOuts}`;
}

// ===========================================
// AGGREGATION
// ===========================================

export function aggregateBaseballBattingStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {
    ab: 0, r: 0, h: 0, single: 0, double: 0, triple: 0, hr: 0,
    rbi: 0, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0,
  };

  for (const game of gameStats) {
    for (const key of Object.keys(totals)) {
      totals[key] += game.stats[key] || 0;
    }
  }

  // Calculate derived stats
  totals.avg = calculateBattingAverage(totals.h, totals.ab);
  totals.obp = calculateOBP(totals.h, totals.bb, totals.hbp, totals.ab, totals.sac);
  totals.slg = calculateSLG(totals.single, totals.double, totals.triple, totals.hr, totals.ab);
  totals.ops = calculateOPS(totals.obp, totals.slg);
  totals.tb = totals.single + (2 * totals.double) + (3 * totals.triple) + (4 * totals.hr);

  return totals;
}

export function aggregateBaseballPitchingStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {
    ip: 0, w: 0, l: 0, sv: 0, h_allowed: 0, r_allowed: 0, er: 0,
    bb_allowed: 0, so_pitching: 0, pitches: 0, strikes: 0, balls: 0,
  };

  for (const game of gameStats) {
    for (const key of Object.keys(totals)) {
      totals[key] += game.stats[key] || 0;
    }
  }

  // Calculate derived stats
  totals.era = calculateERA(totals.er, totals.ip);
  totals.whip = calculateWHIP(totals.bb_allowed, totals.h_allowed, totals.ip);
  totals.k9 = totals.ip > 0 ? (totals.so_pitching * 9) / totals.ip : 0;
  totals.bb9 = totals.ip > 0 ? (totals.bb_allowed * 9) / totals.ip : 0;
  totals.strike_pct = totals.pitches > 0 ? (totals.strikes / totals.pitches) * 100 : 0;

  return totals;
}

// ===========================================
// BOX SCORE GENERATION
// ===========================================

export interface BaseballBoxScore {
  batting: {
    playerId: string;
    playerName: string;
    position: string;
    ab: number;
    r: number;
    h: number;
    rbi: number;
    bb: number;
    so: number;
  }[];
  pitching: {
    playerId: string;
    playerName: string;
    ip: string;
    h: number;
    r: number;
    er: number;
    bb: number;
    so: number;
    pitches: number;
  }[];
  teamTotals: {
    ab: number;
    r: number;
    h: number;
    rbi: number;
    bb: number;
    so: number;
  };
  lineScore: number[]; // Runs per inning
}

export function generateBoxScore(
  playerStats: (PlayerGameStats & { playerName: string; position: string })[],
  lineScore: number[]
): BaseballBoxScore {
  const batting = playerStats
    .filter(p => p.stats.ab > 0 || p.stats.bb > 0)
    .map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      position: p.position,
      ab: p.stats.ab || 0,
      r: p.stats.r || 0,
      h: p.stats.h || 0,
      rbi: p.stats.rbi || 0,
      bb: p.stats.bb || 0,
      so: p.stats.so || 0,
    }));

  const pitching = playerStats
    .filter(p => p.stats.ip > 0)
    .map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      ip: formatInningsPitched(Math.round(p.stats.ip * 3)),
      h: p.stats.h_allowed || 0,
      r: p.stats.r_allowed || 0,
      er: p.stats.er || 0,
      bb: p.stats.bb_allowed || 0,
      so: p.stats.so_pitching || 0,
      pitches: p.stats.pitches || 0,
    }));

  const teamTotals = {
    ab: batting.reduce((sum, p) => sum + p.ab, 0),
    r: batting.reduce((sum, p) => sum + p.r, 0),
    h: batting.reduce((sum, p) => sum + p.h, 0),
    rbi: batting.reduce((sum, p) => sum + p.rbi, 0),
    bb: batting.reduce((sum, p) => sum + p.bb, 0),
    so: batting.reduce((sum, p) => sum + p.so, 0),
  };

  return { batting, pitching, teamTotals, lineScore };
}
