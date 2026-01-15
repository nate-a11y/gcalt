// Soccer Statistics Engine

import { StatDefinition, PlayerGameStats } from './types';

// ===========================================
// STAT DEFINITIONS
// ===========================================

export const SOCCER_STATS: StatDefinition[] = [
  // Attacking
  { key: 'goals', name: 'Goals', abbreviation: 'G', description: 'Goals scored', type: 'counting', higherIsBetter: true },
  { key: 'assists', name: 'Assists', abbreviation: 'A', description: 'Assists', type: 'counting', higherIsBetter: true },
  { key: 'shots', name: 'Shots', abbreviation: 'SH', description: 'Total shots', type: 'counting', higherIsBetter: true },
  { key: 'shots_on_target', name: 'Shots on Target', abbreviation: 'SOT', description: 'Shots on target', type: 'counting', higherIsBetter: true },
  { key: 'shots_off_target', name: 'Shots Off Target', abbreviation: 'SOF', description: 'Shots off target', type: 'counting', higherIsBetter: false },
  { key: 'shots_blocked', name: 'Shots Blocked', abbreviation: 'SB', description: 'Shots blocked by defender', type: 'counting', higherIsBetter: false },

  // Passing
  { key: 'passes', name: 'Passes', abbreviation: 'PAS', description: 'Total passes attempted', type: 'counting', higherIsBetter: true },
  { key: 'passes_completed', name: 'Passes Completed', abbreviation: 'PC', description: 'Successful passes', type: 'counting', higherIsBetter: true },
  { key: 'key_passes', name: 'Key Passes', abbreviation: 'KP', description: 'Passes leading to shots', type: 'counting', higherIsBetter: true },
  { key: 'crosses', name: 'Crosses', abbreviation: 'CRS', description: 'Crosses attempted', type: 'counting', higherIsBetter: true },
  { key: 'crosses_completed', name: 'Crosses Completed', abbreviation: 'CC', description: 'Successful crosses', type: 'counting', higherIsBetter: true },

  // Defending
  { key: 'tackles', name: 'Tackles', abbreviation: 'TKL', description: 'Tackles won', type: 'counting', higherIsBetter: true },
  { key: 'interceptions', name: 'Interceptions', abbreviation: 'INT', description: 'Interceptions', type: 'counting', higherIsBetter: true },
  { key: 'clearances', name: 'Clearances', abbreviation: 'CLR', description: 'Clearances', type: 'counting', higherIsBetter: true },
  { key: 'blocks', name: 'Blocks', abbreviation: 'BLK', description: 'Shots/passes blocked', type: 'counting', higherIsBetter: true },

  // Goalkeeping
  { key: 'saves', name: 'Saves', abbreviation: 'SV', description: 'Saves made', type: 'counting', higherIsBetter: true },
  { key: 'goals_against', name: 'Goals Against', abbreviation: 'GA', description: 'Goals conceded', type: 'counting', higherIsBetter: false },
  { key: 'clean_sheets', name: 'Clean Sheets', abbreviation: 'CS', description: 'Games without conceding', type: 'counting', higherIsBetter: true },
  { key: 'penalties_saved', name: 'Penalties Saved', abbreviation: 'PS', description: 'Penalty kicks saved', type: 'counting', higherIsBetter: true },

  // Discipline
  { key: 'fouls_committed', name: 'Fouls Committed', abbreviation: 'FC', description: 'Fouls committed', type: 'counting', higherIsBetter: false },
  { key: 'fouls_won', name: 'Fouls Won', abbreviation: 'FW', description: 'Fouls won', type: 'counting', higherIsBetter: true },
  { key: 'yellow_cards', name: 'Yellow Cards', abbreviation: 'YC', description: 'Yellow cards received', type: 'counting', higherIsBetter: false },
  { key: 'red_cards', name: 'Red Cards', abbreviation: 'RC', description: 'Red cards received', type: 'counting', higherIsBetter: false },
  { key: 'offsides', name: 'Offsides', abbreviation: 'OFF', description: 'Offside calls', type: 'counting', higherIsBetter: false },

  // Time
  { key: 'minutes_played', name: 'Minutes Played', abbreviation: 'MIN', description: 'Minutes on the field', type: 'counting', higherIsBetter: true },

  // Calculated stats
  { key: 'shot_accuracy', name: 'Shot Accuracy', abbreviation: 'SA%', description: 'Shots on target percentage', type: 'percentage', precision: 1, formula: 'shots_on_target / shots * 100', higherIsBetter: true },
  { key: 'pass_accuracy', name: 'Pass Accuracy', abbreviation: 'PA%', description: 'Pass completion percentage', type: 'percentage', precision: 1, formula: 'passes_completed / passes * 100', higherIsBetter: true },
  { key: 'goals_per_game', name: 'Goals/Game', abbreviation: 'G/G', description: 'Goals per game', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'assists_per_game', name: 'Assists/Game', abbreviation: 'A/G', description: 'Assists per game', type: 'average', precision: 2, higherIsBetter: true },
  { key: 'goal_contributions', name: 'Goal Contributions', abbreviation: 'G+A', description: 'Goals plus assists', type: 'calculated', formula: 'goals + assists', higherIsBetter: true },
  { key: 'save_percentage', name: 'Save %', abbreviation: 'SV%', description: 'Save percentage', type: 'percentage', precision: 1, formula: 'saves / (saves + goals_against) * 100', higherIsBetter: true },
];

// ===========================================
// CALCULATION FUNCTIONS
// ===========================================

export function calculateShotAccuracy(shotsOnTarget: number, totalShots: number): number {
  if (totalShots === 0) return 0;
  return (shotsOnTarget / totalShots) * 100;
}

export function calculatePassAccuracy(passesCompleted: number, totalPasses: number): number {
  if (totalPasses === 0) return 0;
  return (passesCompleted / totalPasses) * 100;
}

export function calculateSavePercentage(saves: number, goalsAgainst: number): number {
  const totalShots = saves + goalsAgainst;
  if (totalShots === 0) return 0;
  return (saves / totalShots) * 100;
}

export function calculateGoalContributions(goals: number, assists: number): number {
  return goals + assists;
}

// ===========================================
// AGGREGATION
// ===========================================

export function aggregateSoccerStats(gameStats: PlayerGameStats[]): Record<string, number> {
  const totals: Record<string, number> = {
    goals: 0, assists: 0, shots: 0, shots_on_target: 0, shots_off_target: 0,
    passes: 0, passes_completed: 0, key_passes: 0, crosses: 0, crosses_completed: 0,
    tackles: 0, interceptions: 0, clearances: 0, blocks: 0,
    saves: 0, goals_against: 0, clean_sheets: 0,
    fouls_committed: 0, fouls_won: 0, yellow_cards: 0, red_cards: 0, offsides: 0,
    minutes_played: 0,
  };

  for (const game of gameStats) {
    for (const key of Object.keys(totals)) {
      totals[key] += game.stats[key] || 0;
    }
  }

  const gamesPlayed = gameStats.length;

  // Calculate derived stats
  totals.shot_accuracy = calculateShotAccuracy(totals.shots_on_target, totals.shots);
  totals.pass_accuracy = calculatePassAccuracy(totals.passes_completed, totals.passes);
  totals.goal_contributions = calculateGoalContributions(totals.goals, totals.assists);
  totals.save_percentage = calculateSavePercentage(totals.saves, totals.goals_against);

  if (gamesPlayed > 0) {
    totals.goals_per_game = totals.goals / gamesPlayed;
    totals.assists_per_game = totals.assists / gamesPlayed;
  }

  return totals;
}

// ===========================================
// MATCH STATS
// ===========================================

export interface SoccerMatchStats {
  possession: number; // Percentage
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  offsides: number;
  passes: number;
  passAccuracy: number;
}

export interface SoccerBoxScore {
  players: {
    playerId: string;
    playerName: string;
    position: string;
    starter: boolean;
    minutes: number;
    goals: number;
    assists: number;
    shots: number;
    shotsOnTarget: number;
    passes: number;
    passAccuracy: number;
    tackles: number;
    interceptions: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  }[];
  teamStats: SoccerMatchStats;
  goalScorers: {
    playerId: string;
    playerName: string;
    minute: number;
    assistedBy?: string;
    isPenalty?: boolean;
    isOwnGoal?: boolean;
  }[];
  halfTimeScore: { home: number; away: number };
  fullTimeScore: { home: number; away: number };
}

export function generateSoccerBoxScore(
  playerStats: (PlayerGameStats & { playerName: string; position: string; starter: boolean })[],
  goalEvents: { playerId: string; minute: number; assistedBy?: string; isPenalty?: boolean; isOwnGoal?: boolean }[],
  teamStats: SoccerMatchStats,
  halfTimeScore: { home: number; away: number },
  fullTimeScore: { home: number; away: number }
): SoccerBoxScore {
  const players = playerStats.map(p => ({
    playerId: p.playerId,
    playerName: p.playerName,
    position: p.position,
    starter: p.starter,
    minutes: p.stats.minutes_played || 0,
    goals: p.stats.goals || 0,
    assists: p.stats.assists || 0,
    shots: p.stats.shots || 0,
    shotsOnTarget: p.stats.shots_on_target || 0,
    passes: p.stats.passes || 0,
    passAccuracy: calculatePassAccuracy(p.stats.passes_completed || 0, p.stats.passes || 0),
    tackles: p.stats.tackles || 0,
    interceptions: p.stats.interceptions || 0,
    fouls: p.stats.fouls_committed || 0,
    yellowCards: p.stats.yellow_cards || 0,
    redCards: p.stats.red_cards || 0,
  }));

  // Sort: starters first, then by position order (GK, DEF, MID, FWD)
  const positionOrder: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
  players.sort((a, b) => {
    if (a.starter !== b.starter) return a.starter ? -1 : 1;
    return (positionOrder[a.position] || 99) - (positionOrder[b.position] || 99);
  });

  const goalScorers = goalEvents.map(e => ({
    playerId: e.playerId,
    playerName: playerStats.find(p => p.playerId === e.playerId)?.playerName || 'Unknown',
    minute: e.minute,
    assistedBy: e.assistedBy,
    isPenalty: e.isPenalty,
    isOwnGoal: e.isOwnGoal,
  }));

  return {
    players,
    teamStats,
    goalScorers,
    halfTimeScore,
    fullTimeScore,
  };
}
