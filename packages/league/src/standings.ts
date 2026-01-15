// Standings Calculator
// Calculates and sorts team standings with tiebreakers

import type { TeamStanding, Standings, TiebreakerRule, LeagueSettings } from './types';

export interface GameResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  isOvertime?: boolean;
  isShootout?: boolean;
}

// ===========================================
// STANDINGS CALCULATION
// ===========================================

export function calculateStandings(
  games: GameResult[],
  teamInfo: Map<string, { name: string; divisionId: string }>,
  settings: LeagueSettings
): TeamStanding[] {
  // Initialize standings for each team
  const standingsMap = new Map<string, TeamStanding>();

  for (const [teamId, info] of teamInfo) {
    standingsMap.set(teamId, createEmptyStanding(teamId, info.name, info.divisionId));
  }

  // Process each game
  for (const game of games) {
    updateStandingsFromGame(standingsMap, game, settings);
  }

  // Calculate derived values
  const standings = Array.from(standingsMap.values());

  for (const team of standings) {
    const totalGames = team.wins + team.losses + team.ties;
    team.winPercentage = totalGames > 0
      ? (team.wins + team.ties * 0.5) / totalGames
      : 0;
    team.pointDifferential = team.pointsFor - team.pointsAgainst;
  }

  // Sort standings
  const sorted = sortStandings(standings, games, settings);

  // Assign ranks and games back
  assignRanks(sorted, settings);

  // Calculate streaks
  calculateStreaks(sorted, games);

  return sorted;
}

function createEmptyStanding(
  teamId: string,
  teamName: string,
  divisionId: string
): TeamStanding {
  return {
    teamId,
    teamName,
    divisionId,
    wins: 0,
    losses: 0,
    ties: 0,
    overtimeWins: 0,
    overtimeLosses: 0,
    points: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointDifferential: 0,
    winPercentage: 0,
    streak: '',
    last5: '',
    rank: 0,
    gamesBack: 0,
  };
}

function updateStandingsFromGame(
  standings: Map<string, TeamStanding>,
  game: GameResult,
  settings: LeagueSettings
): void {
  const home = standings.get(game.homeTeamId);
  const away = standings.get(game.awayTeamId);

  if (!home || !away) return;

  // Update points for/against
  home.pointsFor += game.homeScore;
  home.pointsAgainst += game.awayScore;
  away.pointsFor += game.awayScore;
  away.pointsAgainst += game.homeScore;

  // Determine winner
  if (game.homeScore > game.awayScore) {
    if (game.isOvertime) {
      home.overtimeWins++;
      away.overtimeLosses++;
      home.points += settings.pointsForOTWin || settings.pointsForWin;
      away.points += settings.pointsForOTLoss || settings.pointsForLoss;
    } else {
      home.wins++;
      away.losses++;
      home.points += settings.pointsForWin;
      away.points += settings.pointsForLoss;
    }
  } else if (game.awayScore > game.homeScore) {
    if (game.isOvertime) {
      away.overtimeWins++;
      home.overtimeLosses++;
      away.points += settings.pointsForOTWin || settings.pointsForWin;
      home.points += settings.pointsForOTLoss || settings.pointsForLoss;
    } else {
      away.wins++;
      home.losses++;
      away.points += settings.pointsForWin;
      home.points += settings.pointsForLoss;
    }
  } else {
    home.ties++;
    away.ties++;
    home.points += settings.pointsForTie;
    away.points += settings.pointsForTie;
  }
}

// ===========================================
// SORTING WITH TIEBREAKERS
// ===========================================

function sortStandings(
  standings: TeamStanding[],
  games: GameResult[],
  settings: LeagueSettings
): TeamStanding[] {
  return standings.sort((a, b) => {
    // Primary sort by standings format
    const primaryDiff = getPrimarySort(a, b, settings);
    if (primaryDiff !== 0) return primaryDiff;

    // Apply tiebreakers
    for (const tiebreaker of settings.tiebreakers) {
      const diff = applyTiebreaker(a, b, tiebreaker, games);
      if (diff !== 0) return diff;
    }

    return 0;
  });
}

function getPrimarySort(a: TeamStanding, b: TeamStanding, settings: LeagueSettings): number {
  switch (settings.standingsFormat) {
    case 'points':
      return b.points - a.points;
    case 'percentage':
      return b.winPercentage - a.winPercentage;
    case 'wins':
    default:
      return b.wins - a.wins;
  }
}

function applyTiebreaker(
  a: TeamStanding,
  b: TeamStanding,
  rule: TiebreakerRule,
  games: GameResult[]
): number {
  switch (rule) {
    case 'head_to_head':
      return getHeadToHeadRecord(a.teamId, b.teamId, games);

    case 'point_differential':
      return b.pointDifferential - a.pointDifferential;

    case 'points_for':
      return b.pointsFor - a.pointsFor;

    case 'points_against':
      return a.pointsAgainst - b.pointsAgainst;

    case 'wins':
      return b.wins - a.wins;

    case 'division_record':
      // Would need division info
      return 0;

    case 'common_opponents':
      // Would need full schedule analysis
      return 0;

    case 'coin_flip':
      return 0; // Random, handled elsewhere

    default:
      return 0;
  }
}

function getHeadToHeadRecord(teamA: string, teamB: string, games: GameResult[]): number {
  let aWins = 0;
  let bWins = 0;

  for (const game of games) {
    if (game.homeTeamId === teamA && game.awayTeamId === teamB) {
      if (game.homeScore > game.awayScore) aWins++;
      else if (game.awayScore > game.homeScore) bWins++;
    } else if (game.homeTeamId === teamB && game.awayTeamId === teamA) {
      if (game.homeScore > game.awayScore) bWins++;
      else if (game.awayScore > game.homeScore) aWins++;
    }
  }

  return bWins - aWins;
}

// ===========================================
// RANK ASSIGNMENT
// ===========================================

function assignRanks(standings: TeamStanding[], settings: LeagueSettings): void {
  if (standings.length === 0) return;

  // Assign ranks
  standings[0].rank = 1;
  standings[0].gamesBack = 0;

  const leader = standings[0];
  const leaderTotal = leader.wins + leader.losses + leader.ties;

  for (let i = 1; i < standings.length; i++) {
    const team = standings[i];
    const prev = standings[i - 1];

    // Check if tied with previous team
    const isTied = getPrimarySort(team, prev, settings) === 0;
    team.rank = isTied ? prev.rank : i + 1;

    // Calculate games back
    const teamTotal = team.wins + team.losses + team.ties;
    team.gamesBack = ((leader.wins - team.wins) + (team.losses - leader.losses)) / 2;
  }
}

// ===========================================
// STREAKS
// ===========================================

function calculateStreaks(standings: TeamStanding[], games: GameResult[]): void {
  // Sort games by date (assuming they're in order)
  // This is a simplified version - real implementation would use game dates

  for (const team of standings) {
    const teamGames = games.filter(
      g => g.homeTeamId === team.teamId || g.awayTeamId === team.teamId
    );

    // Get last 5 results
    const last5Games = teamGames.slice(-5);
    const results: ('W' | 'L' | 'T')[] = [];

    for (const game of last5Games) {
      const isHome = game.homeTeamId === team.teamId;
      const teamScore = isHome ? game.homeScore : game.awayScore;
      const oppScore = isHome ? game.awayScore : game.homeScore;

      if (teamScore > oppScore) results.push('W');
      else if (oppScore > teamScore) results.push('L');
      else results.push('T');
    }

    team.last5 = results.join('');

    // Calculate current streak
    if (results.length > 0) {
      const lastResult = results[results.length - 1];
      let streakCount = 1;

      for (let i = results.length - 2; i >= 0; i--) {
        if (results[i] === lastResult) {
          streakCount++;
        } else {
          break;
        }
      }

      team.streak = `${lastResult}${streakCount}`;
    }
  }
}

// ===========================================
// PLAYOFF CLINCHING
// ===========================================

export function calculateClinching(
  standings: TeamStanding[],
  remainingGames: GameResult[],
  playoffSpots: number
): void {
  // Magic number calculation
  for (const team of standings) {
    const gamesRemaining = remainingGames.filter(
      g => g.homeTeamId === team.teamId || g.awayTeamId === team.teamId
    ).length;

    // Simplified clinching - team has clinched if mathematically can't be caught
    if (team.rank <= playoffSpots) {
      const maxPossibleLosses = team.losses; // Already have these

      // Check if team below playoff line can catch up
      const bubbleTeam = standings[playoffSpots];
      if (bubbleTeam) {
        const bubbleMaxWins = bubbleTeam.wins + gamesRemaining;
        if (team.wins > bubbleMaxWins) {
          team.clinched = 'playoff';
        }
      }
    }

    // Check if eliminated
    if (team.rank > playoffSpots) {
      const teamMaxWins = team.wins + gamesRemaining;
      const playoffTeam = standings[playoffSpots - 1];

      if (playoffTeam && teamMaxWins < playoffTeam.wins) {
        team.clinched = 'eliminated';
      }
    }
  }
}

// ===========================================
// STANDINGS FORMATTING
// ===========================================

export function formatRecord(team: TeamStanding): string {
  if (team.ties > 0) {
    return `${team.wins}-${team.losses}-${team.ties}`;
  }
  return `${team.wins}-${team.losses}`;
}

export function formatGamesBack(gamesBack: number): string {
  if (gamesBack === 0) return '-';
  if (Number.isInteger(gamesBack)) return gamesBack.toString();
  return gamesBack.toFixed(1);
}
