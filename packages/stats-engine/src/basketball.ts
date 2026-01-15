// Basketball Statistics Engine

import { StatDefinition, PlayerGameStats } from './types';

// ===========================================
// STAT DEFINITIONS
// ===========================================

export const BASKETBALL_STATS: StatDefinition[] = [
  // Scoring
  { key: 'pts', name: 'Points', abbreviation: 'PTS', description: 'Total points scored', type: 'counting', higherIsBetter: true },
  { key: 'fgm', name: 'Field Goals Made', abbreviation: 'FGM', description: 'Field goals made', type: 'counting', higherIsBetter: true },
  { key: 'fga', name: 'Field Goals Attempted', abbreviation: 'FGA', description: 'Field goals attempted', type: 'counting', higherIsBetter: false },
  { key: 'fg3m', name: '3-Pointers Made', abbreviation: '3PM', description: 'Three-point field goals made', type: 'counting', higherIsBetter: true },
  { key: 'fg3a', name: '3-Pointers Attempted', abbreviation: '3PA', description: 'Three-point field goals attempted', type: 'counting', higherIsBetter: false },
  { key: 'ftm', name: 'Free Throws Made', abbreviation: 'FTM', description: 'Free throws made', type: 'counting', higherIsBetter: true },
  { key: 'fta', name: 'Free Throws Attempted', abbreviation: 'FTA', description: 'Free throws attempted', type: 'counting', higherIsBetter: false },

  // Rebounds
  { key: 'oreb', name: 'Offensive Rebounds', abbreviation: 'OREB', description: 'Offensive rebounds', type: 'counting', higherIsBetter: true },
  { key: 'dreb', name: 'Defensive Rebounds', abbreviation: 'DREB', description: 'Defensive rebounds', type: 'counting', higherIsBetter: true },
  { key: 'reb', name: 'Total Rebounds', abbreviation: 'REB', description: 'Total rebounds', type: 'counting', higherIsBetter: true },

  // Playmaking
  { key: 'ast', name: 'Assists', abbreviation: 'AST', description: 'Assists', type: 'counting', higherIsBetter: true },
  { key: 'tov', name: 'Turnovers', abbreviation: 'TOV', description: 'Turnovers', type: 'counting', higherIsBetter: false },

  // Defense
  { key: 'stl', name: 'Steals', abbreviation: 'STL', description: 'Steals', type: 'counting', higherIsBetter: true },
  { key: 'blk', name: 'Blocks', abbreviation: 'BLK', description: 'Blocks', type: 'counting', higherIsBetter: true },

  // Fouls
  { key: 'pf', name: 'Personal Fouls', abbreviation: 'PF', description: 'Personal fouls', type: 'counting', higherIsBetter: false },

  // Time
  { key: 'min', name: 'Minutes', abbreviation: 'MIN', description: 'Minutes played', type: 'counting', precision: 1, higherIsBetter: true },

  // Calculated stats
  { key: 'fg_pct', name: 'Field Goal %', abbreviation: 'FG%', description: 'Field goal percentage', type: 'percentage', precision: 1, formula: 'fgm / fga * 100', higherIsBetter: true },
  { key: 'fg3_pct', name: '3-Point %', abbreviation: '3P%', description: 'Three-point percentage', type: 'percentage', precision: 1, formula: 'fg3m / fg3a * 100', higherIsBetter: true },
  { key: 'ft_pct', name: 'Free Throw %', abbreviation: 'FT%', description: 'Free throw percentage', type: 'percentage', precision: 1, formula: 'ftm / fta * 100', higherIsBetter: true },
  { key: 'efg_pct', name: 'Effective FG%', abbreviation: 'eFG%', description: 'Effective field goal percentage', type: 'percentage', precision: 1, formula: '(fgm + 0.5 * fg3m) / fga * 100', higherIsBetter: true },
  { key: 'ts_pct', name: 'True Shooting %', abbreviation: 'TS%', description: 'True shooting percentage', type: 'percentage', precision: 1, formula: 'pts / (2 * (fga + 0.44 * fta)) * 100', higherIsBetter: true },
  { key: 'ast_tov', name: 'Assist/Turnover Ratio', abbreviation: 'AST/TO', description: 'Assists per turnover', type: 'calculated', precision: 2, formula: 'ast / tov', higherIsBetter: true },
  { key: 'ppg', name: 'Points Per Game', abbreviation: 'PPG', description: 'Average points per game', type: 'average', precision: 1, higherIsBetter: true },
  { key: 'rpg', name: 'Rebounds Per Game', abbreviation: 'RPG', description: 'Average rebounds per game', type: 'average', precision: 1, higherIsBetter: true },
  { key: 'apg', name: 'Assists Per Game', abbreviation: 'APG', description: 'Average assists per game', type: 'average', precision: 1, higherIsBetter: true },
];

// ===========================================
// CALCULATION FUNCTIONS
// ===========================================

export function calculateFGPct(made: number, attempted: number): number {
  if (attempted === 0) return 0;
  return (made / attempted) * 100;
}

export function calculateEffectiveFGPct(fgm: number, fg3m: number, fga: number): number {
  if (fga === 0) return 0;
  return ((fgm + 0.5 * fg3m) / fga) * 100;
}

export function calculateTrueShootingPct(pts: number, fga: number, fta: number): number {
  const tsa = fga + 0.44 * fta; // True shooting attempts
  if (tsa === 0) return 0;
  return (pts / (2 * tsa)) * 100;
}

export function calculateAstTovRatio(ast: number, tov: number): number {
  if (tov === 0) return ast > 0 ? Infinity : 0;
  return ast / tov;
}

export function calculatePoints(fgm: number, fg3m: number, ftm: number): number {
  // 2-pointers = fgm - fg3m, 3-pointers = fg3m, free throws = ftm
  return (fgm - fg3m) * 2 + fg3m * 3 + ftm;
}

// ===========================================
// FORMATTING FUNCTIONS
// ===========================================

export function formatPercentage(pct: number): string {
  return pct.toFixed(1) + '%';
}

export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ===========================================
// AGGREGATION
// ===========================================

export function aggregateBasketballStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {
    pts: 0, fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
    oreb: 0, dreb: 0, reb: 0, ast: 0, tov: 0, stl: 0, blk: 0, pf: 0, min: 0,
  };

  for (const game of gameStats) {
    for (const key of Object.keys(totals)) {
      totals[key] += game.stats[key] || 0;
    }
  }

  const gamesPlayed = gameStats.length;

  // Calculate derived stats
  totals.fg_pct = calculateFGPct(totals.fgm, totals.fga);
  totals.fg3_pct = calculateFGPct(totals.fg3m, totals.fg3a);
  totals.ft_pct = calculateFGPct(totals.ftm, totals.fta);
  totals.efg_pct = calculateEffectiveFGPct(totals.fgm, totals.fg3m, totals.fga);
  totals.ts_pct = calculateTrueShootingPct(totals.pts, totals.fga, totals.fta);
  totals.ast_tov = calculateAstTovRatio(totals.ast, totals.tov);

  // Per-game averages
  if (gamesPlayed > 0) {
    totals.ppg = totals.pts / gamesPlayed;
    totals.rpg = totals.reb / gamesPlayed;
    totals.apg = totals.ast / gamesPlayed;
  }

  return totals;
}

// ===========================================
// BOX SCORE GENERATION
// ===========================================

export interface BasketballBoxScore {
  players: {
    playerId: string;
    playerName: string;
    position: string;
    starter: boolean;
    min: string;
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    fgm: number;
    fga: number;
    fg3m: number;
    fg3a: number;
    ftm: number;
    fta: number;
  }[];
  teamTotals: {
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    fgm: number;
    fga: number;
    fg3m: number;
    fg3a: number;
    ftm: number;
    fta: number;
    fg_pct: number;
    fg3_pct: number;
    ft_pct: number;
  };
  quarterScores: number[]; // Score per quarter
}

export function generateBasketballBoxScore(
  playerStats: (PlayerGameStats & { playerName: string; position: string; starter: boolean })[],
  quarterScores: number[]
): BasketballBoxScore {
  const players = playerStats.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    position: p.position,
    starter: p.starter,
    min: formatMinutes(p.stats.min || 0),
    pts: p.stats.pts || 0,
    reb: (p.stats.oreb || 0) + (p.stats.dreb || 0),
    ast: p.stats.ast || 0,
    stl: p.stats.stl || 0,
    blk: p.stats.blk || 0,
    tov: p.stats.tov || 0,
    pf: p.stats.pf || 0,
    fgm: p.stats.fgm || 0,
    fga: p.stats.fga || 0,
    fg3m: p.stats.fg3m || 0,
    fg3a: p.stats.fg3a || 0,
    ftm: p.stats.ftm || 0,
    fta: p.stats.fta || 0,
  }));

  // Sort: starters first, then by points
  players.sort((a, b) => {
    if (a.starter !== b.starter) return a.starter ? -1 : 1;
    return b.pts - a.pts;
  });

  const teamTotals = {
    pts: players.reduce((sum, p) => sum + p.pts, 0),
    reb: players.reduce((sum, p) => sum + p.reb, 0),
    ast: players.reduce((sum, p) => sum + p.ast, 0),
    stl: players.reduce((sum, p) => sum + p.stl, 0),
    blk: players.reduce((sum, p) => sum + p.blk, 0),
    tov: players.reduce((sum, p) => sum + p.tov, 0),
    pf: players.reduce((sum, p) => sum + p.pf, 0),
    fgm: players.reduce((sum, p) => sum + p.fgm, 0),
    fga: players.reduce((sum, p) => sum + p.fga, 0),
    fg3m: players.reduce((sum, p) => sum + p.fg3m, 0),
    fg3a: players.reduce((sum, p) => sum + p.fg3a, 0),
    ftm: players.reduce((sum, p) => sum + p.ftm, 0),
    fta: players.reduce((sum, p) => sum + p.fta, 0),
    fg_pct: 0,
    fg3_pct: 0,
    ft_pct: 0,
  };

  teamTotals.fg_pct = calculateFGPct(teamTotals.fgm, teamTotals.fga);
  teamTotals.fg3_pct = calculateFGPct(teamTotals.fg3m, teamTotals.fg3a);
  teamTotals.ft_pct = calculateFGPct(teamTotals.ftm, teamTotals.fta);

  return { players, teamTotals, quarterScores };
}
