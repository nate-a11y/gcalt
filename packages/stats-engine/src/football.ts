// American Football Statistics Engine

import { StatDefinition, PlayerGameStats } from './types';

// ===========================================
// STAT DEFINITIONS
// ===========================================

export const FOOTBALL_PASSING_STATS: StatDefinition[] = [
  { key: 'pass_att', name: 'Pass Attempts', abbreviation: 'ATT', description: 'Passes attempted', type: 'counting', higherIsBetter: true },
  { key: 'pass_comp', name: 'Completions', abbreviation: 'CMP', description: 'Passes completed', type: 'counting', higherIsBetter: true },
  { key: 'pass_yds', name: 'Passing Yards', abbreviation: 'YDS', description: 'Passing yards', type: 'counting', higherIsBetter: true },
  { key: 'pass_td', name: 'Passing TDs', abbreviation: 'TD', description: 'Passing touchdowns', type: 'counting', higherIsBetter: true },
  { key: 'pass_int', name: 'Interceptions', abbreviation: 'INT', description: 'Interceptions thrown', type: 'counting', higherIsBetter: false },
  { key: 'sacks', name: 'Sacks Taken', abbreviation: 'SCK', description: 'Times sacked', type: 'counting', higherIsBetter: false },
  { key: 'pass_long', name: 'Longest Pass', abbreviation: 'LNG', description: 'Longest completion', type: 'counting', higherIsBetter: true },
  { key: 'comp_pct', name: 'Completion %', abbreviation: 'CMP%', description: 'Completion percentage', type: 'percentage', precision: 1, formula: 'pass_comp / pass_att * 100', higherIsBetter: true },
  { key: 'pass_ypa', name: 'Yards/Attempt', abbreviation: 'Y/A', description: 'Yards per attempt', type: 'calculated', precision: 1, formula: 'pass_yds / pass_att', higherIsBetter: true },
  { key: 'passer_rating', name: 'Passer Rating', abbreviation: 'RTG', description: 'Passer rating', type: 'calculated', precision: 1, higherIsBetter: true },
];

export const FOOTBALL_RUSHING_STATS: StatDefinition[] = [
  { key: 'rush_att', name: 'Rush Attempts', abbreviation: 'ATT', description: 'Rushing attempts', type: 'counting', higherIsBetter: true },
  { key: 'rush_yds', name: 'Rushing Yards', abbreviation: 'YDS', description: 'Rushing yards', type: 'counting', higherIsBetter: true },
  { key: 'rush_td', name: 'Rushing TDs', abbreviation: 'TD', description: 'Rushing touchdowns', type: 'counting', higherIsBetter: true },
  { key: 'rush_long', name: 'Longest Rush', abbreviation: 'LNG', description: 'Longest rush', type: 'counting', higherIsBetter: true },
  { key: 'fumbles', name: 'Fumbles', abbreviation: 'FUM', description: 'Fumbles', type: 'counting', higherIsBetter: false },
  { key: 'fumbles_lost', name: 'Fumbles Lost', abbreviation: 'LOST', description: 'Fumbles lost', type: 'counting', higherIsBetter: false },
  { key: 'rush_ypc', name: 'Yards/Carry', abbreviation: 'Y/C', description: 'Yards per carry', type: 'calculated', precision: 1, formula: 'rush_yds / rush_att', higherIsBetter: true },
];

export const FOOTBALL_RECEIVING_STATS: StatDefinition[] = [
  { key: 'targets', name: 'Targets', abbreviation: 'TGT', description: 'Pass targets', type: 'counting', higherIsBetter: true },
  { key: 'receptions', name: 'Receptions', abbreviation: 'REC', description: 'Receptions', type: 'counting', higherIsBetter: true },
  { key: 'rec_yds', name: 'Receiving Yards', abbreviation: 'YDS', description: 'Receiving yards', type: 'counting', higherIsBetter: true },
  { key: 'rec_td', name: 'Receiving TDs', abbreviation: 'TD', description: 'Receiving touchdowns', type: 'counting', higherIsBetter: true },
  { key: 'rec_long', name: 'Longest Reception', abbreviation: 'LNG', description: 'Longest reception', type: 'counting', higherIsBetter: true },
  { key: 'rec_ypr', name: 'Yards/Reception', abbreviation: 'Y/R', description: 'Yards per reception', type: 'calculated', precision: 1, formula: 'rec_yds / receptions', higherIsBetter: true },
  { key: 'catch_pct', name: 'Catch %', abbreviation: 'CTH%', description: 'Catch percentage', type: 'percentage', precision: 1, formula: 'receptions / targets * 100', higherIsBetter: true },
];

export const FOOTBALL_DEFENSE_STATS: StatDefinition[] = [
  { key: 'tackles_total', name: 'Total Tackles', abbreviation: 'TKL', description: 'Total tackles', type: 'counting', higherIsBetter: true },
  { key: 'tackles_solo', name: 'Solo Tackles', abbreviation: 'SOLO', description: 'Solo tackles', type: 'counting', higherIsBetter: true },
  { key: 'tackles_ast', name: 'Assisted Tackles', abbreviation: 'AST', description: 'Assisted tackles', type: 'counting', higherIsBetter: true },
  { key: 'tackles_for_loss', name: 'Tackles for Loss', abbreviation: 'TFL', description: 'Tackles for loss', type: 'counting', higherIsBetter: true },
  { key: 'sacks_made', name: 'Sacks', abbreviation: 'SCK', description: 'Sacks made', type: 'counting', precision: 1, higherIsBetter: true },
  { key: 'qb_hits', name: 'QB Hits', abbreviation: 'QBH', description: 'Quarterback hits', type: 'counting', higherIsBetter: true },
  { key: 'interceptions_def', name: 'Interceptions', abbreviation: 'INT', description: 'Interceptions', type: 'counting', higherIsBetter: true },
  { key: 'int_yds', name: 'INT Return Yards', abbreviation: 'YDS', description: 'Interception return yards', type: 'counting', higherIsBetter: true },
  { key: 'int_td', name: 'INT Return TDs', abbreviation: 'TD', description: 'Interception return touchdowns', type: 'counting', higherIsBetter: true },
  { key: 'pass_deflected', name: 'Passes Deflected', abbreviation: 'PD', description: 'Passes deflected', type: 'counting', higherIsBetter: true },
  { key: 'forced_fumbles', name: 'Forced Fumbles', abbreviation: 'FF', description: 'Forced fumbles', type: 'counting', higherIsBetter: true },
  { key: 'fumble_rec', name: 'Fumble Recoveries', abbreviation: 'FR', description: 'Fumbles recovered', type: 'counting', higherIsBetter: true },
];

export const FOOTBALL_KICKING_STATS: StatDefinition[] = [
  { key: 'fg_att', name: 'FG Attempts', abbreviation: 'FGA', description: 'Field goal attempts', type: 'counting', higherIsBetter: true },
  { key: 'fg_made', name: 'FG Made', abbreviation: 'FGM', description: 'Field goals made', type: 'counting', higherIsBetter: true },
  { key: 'fg_long', name: 'Longest FG', abbreviation: 'LNG', description: 'Longest field goal', type: 'counting', higherIsBetter: true },
  { key: 'xp_att', name: 'XP Attempts', abbreviation: 'XPA', description: 'Extra point attempts', type: 'counting', higherIsBetter: true },
  { key: 'xp_made', name: 'XP Made', abbreviation: 'XPM', description: 'Extra points made', type: 'counting', higherIsBetter: true },
  { key: 'fg_pct', name: 'FG %', abbreviation: 'FG%', description: 'Field goal percentage', type: 'percentage', precision: 1, formula: 'fg_made / fg_att * 100', higherIsBetter: true },
  { key: 'punts', name: 'Punts', abbreviation: 'P', description: 'Punts', type: 'counting', higherIsBetter: false },
  { key: 'punt_yds', name: 'Punt Yards', abbreviation: 'YDS', description: 'Total punt yards', type: 'counting', higherIsBetter: true },
  { key: 'punt_avg', name: 'Punt Average', abbreviation: 'AVG', description: 'Yards per punt', type: 'calculated', precision: 1, formula: 'punt_yds / punts', higherIsBetter: true },
];

// ===========================================
// CALCULATION FUNCTIONS
// ===========================================

export function calculatePasserRating(
  completions: number,
  attempts: number,
  yards: number,
  touchdowns: number,
  interceptions: number
): number {
  if (attempts === 0) return 0;

  // NFL Passer Rating formula
  const a = Math.min(Math.max((completions / attempts - 0.3) * 5, 0), 2.375);
  const b = Math.min(Math.max((yards / attempts - 3) * 0.25, 0), 2.375);
  const c = Math.min(Math.max((touchdowns / attempts) * 20, 0), 2.375);
  const d = Math.min(Math.max(2.375 - (interceptions / attempts) * 25, 0), 2.375);

  return ((a + b + c + d) / 6) * 100;
}

export function calculateYardsPerAttempt(yards: number, attempts: number): number {
  if (attempts === 0) return 0;
  return yards / attempts;
}

export function calculateCompletionPct(completions: number, attempts: number): number {
  if (attempts === 0) return 0;
  return (completions / attempts) * 100;
}

// ===========================================
// AGGREGATION
// ===========================================

export function aggregateFootballStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {
    // Passing
    pass_att: 0, pass_comp: 0, pass_yds: 0, pass_td: 0, pass_int: 0, sacks: 0,
    // Rushing
    rush_att: 0, rush_yds: 0, rush_td: 0, fumbles: 0, fumbles_lost: 0,
    // Receiving
    targets: 0, receptions: 0, rec_yds: 0, rec_td: 0,
    // Defense
    tackles_total: 0, tackles_solo: 0, tackles_ast: 0, tackles_for_loss: 0,
    sacks_made: 0, qb_hits: 0, interceptions_def: 0, pass_deflected: 0,
    forced_fumbles: 0, fumble_rec: 0,
    // Kicking
    fg_att: 0, fg_made: 0, xp_att: 0, xp_made: 0, punts: 0, punt_yds: 0,
  };

  for (const game of gameStats) {
    for (const key of Object.keys(totals)) {
      totals[key] += game.stats[key] || 0;
    }
  }

  // Calculate derived stats
  totals.comp_pct = calculateCompletionPct(totals.pass_comp, totals.pass_att);
  totals.pass_ypa = calculateYardsPerAttempt(totals.pass_yds, totals.pass_att);
  totals.passer_rating = calculatePasserRating(
    totals.pass_comp, totals.pass_att, totals.pass_yds, totals.pass_td, totals.pass_int
  );
  totals.rush_ypc = calculateYardsPerAttempt(totals.rush_yds, totals.rush_att);
  totals.rec_ypr = calculateYardsPerAttempt(totals.rec_yds, totals.receptions);
  totals.catch_pct = calculateCompletionPct(totals.receptions, totals.targets);
  totals.fg_pct = calculateCompletionPct(totals.fg_made, totals.fg_att);
  totals.punt_avg = calculateYardsPerAttempt(totals.punt_yds, totals.punts);

  return totals;
}

// ===========================================
// BOX SCORE
// ===========================================

export interface FootballBoxScore {
  passing: {
    playerId: string;
    playerName: string;
    comp: number;
    att: number;
    yds: number;
    td: number;
    int: number;
    rating: number;
  }[];
  rushing: {
    playerId: string;
    playerName: string;
    att: number;
    yds: number;
    avg: number;
    td: number;
    long: number;
  }[];
  receiving: {
    playerId: string;
    playerName: string;
    rec: number;
    yds: number;
    avg: number;
    td: number;
    long: number;
    targets: number;
  }[];
  defense: {
    playerId: string;
    playerName: string;
    tkl: number;
    solo: number;
    ast: number;
    tfl: number;
    sacks: number;
    int: number;
    pd: number;
  }[];
  quarterScores: number[];
  teamStats: {
    firstDowns: number;
    totalYards: number;
    passingYards: number;
    rushingYards: number;
    turnovers: number;
    penalties: number;
    penaltyYards: number;
    thirdDownConv: string;
    fourthDownConv: string;
    timeOfPossession: string;
  };
}
