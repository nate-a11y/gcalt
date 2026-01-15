// Schedule Generator
// Creates round-robin and bracket schedules

import type { ScheduledGame, TournamentFormat, BracketRound, BracketGame } from './types';

// Generate unique ID
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===========================================
// ROUND ROBIN SCHEDULE
// ===========================================

export interface RoundRobinOptions {
  teamIds: string[];
  startDate: Date;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  gamesPerDay: number;
  timeBetweenGames: number; // minutes
  firstGameTime: string; // "18:00"
  homeAndAway: boolean; // Play each matchup twice
  scheduleId: string;
}

export function generateRoundRobin(options: RoundRobinOptions): ScheduledGame[] {
  const { teamIds, startDate, daysOfWeek, gamesPerDay, timeBetweenGames, firstGameTime, homeAndAway, scheduleId } = options;

  const games: ScheduledGame[] = [];
  const matchups = generateRoundRobinMatchups(teamIds);

  // Double matchups for home-and-away
  const allMatchups = homeAndAway
    ? [...matchups, ...matchups.map(m => [m[1], m[0]])]
    : matchups;

  // Schedule games
  let currentDate = new Date(startDate);
  let matchupIndex = 0;
  let week = 1;

  while (matchupIndex < allMatchups.length) {
    // Find next valid day
    while (!daysOfWeek.includes(currentDate.getDay())) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Schedule games for this day
    const [startHour, startMin] = firstGameTime.split(':').map(Number);

    for (let i = 0; i < gamesPerDay && matchupIndex < allMatchups.length; i++) {
      const [homeTeamId, awayTeamId] = allMatchups[matchupIndex];

      const gameTime = new Date(currentDate);
      gameTime.setHours(startHour, startMin + (i * timeBetweenGames), 0, 0);

      games.push({
        id: generateId(),
        scheduleId,
        week,
        homeTeamId,
        awayTeamId,
        scheduledAt: gameTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'scheduled',
      });

      matchupIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
    if (daysOfWeek.includes(currentDate.getDay())) {
      week++;
    }
  }

  return games;
}

// Circle method for round-robin pairings
function generateRoundRobinMatchups(teamIds: string[]): [string, string][] {
  const teams = [...teamIds];
  const matchups: [string, string][] = [];

  // Add bye team if odd number
  if (teams.length % 2 !== 0) {
    teams.push('BYE');
  }

  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];

      // Skip bye games
      if (home !== 'BYE' && away !== 'BYE') {
        matchups.push([home, away]);
      }
    }

    // Rotate teams (keep first team fixed)
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  return matchups;
}

// ===========================================
// BRACKET GENERATION
// ===========================================

export interface BracketOptions {
  teamCount: number;
  format: TournamentFormat;
  bracketId: string;
  seeds?: string[]; // Team IDs in seed order
}

export function generateBracket(options: BracketOptions): BracketRound[] {
  const { format, bracketId, teamCount, seeds } = options;

  switch (format) {
    case 'single_elimination':
      return generateSingleEliminationBracket(bracketId, teamCount, seeds);
    case 'double_elimination':
      return generateDoubleEliminationBracket(bracketId, teamCount, seeds);
    default:
      return generateSingleEliminationBracket(bracketId, teamCount, seeds);
  }
}

function generateSingleEliminationBracket(
  bracketId: string,
  teamCount: number,
  seeds?: string[]
): BracketRound[] {
  // Find next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamCount)));
  const rounds: BracketRound[] = [];

  let gamesInRound = bracketSize / 2;
  let roundNumber = 1;
  let totalGames = 0;

  while (gamesInRound >= 1) {
    const roundId = generateId();
    const games: BracketGame[] = [];

    for (let i = 0; i < gamesInRound; i++) {
      const gameNumber = totalGames + i + 1;

      const game: BracketGame = {
        id: generateId(),
        roundId,
        gameNumber,
        status: 'pending',
      };

      // First round - assign seeds
      if (roundNumber === 1) {
        const topSeedNum = i + 1;
        const bottomSeedNum = bracketSize - i;

        game.topSeed = topSeedNum;
        game.bottomSeed = bottomSeedNum;

        if (seeds) {
          game.topTeamId = seeds[topSeedNum - 1];
          // Check if bottom seed exists (might be bye)
          if (bottomSeedNum <= teamCount) {
            game.bottomTeamId = seeds[bottomSeedNum - 1];
          } else {
            // Bye - top team advances automatically
            game.winnerId = game.topTeamId;
            game.status = 'completed';
          }
        }
      } else {
        // Later rounds - source from previous round
        const prevRoundGames = gamesInRound * 2;
        const topSourceGame = (i * 2) + 1;
        const bottomSourceGame = (i * 2) + 2;

        game.topSource = {
          roundId: rounds[roundNumber - 2].id,
          gameNumber: topSourceGame + (totalGames - prevRoundGames),
          position: 'winner',
        };
        game.bottomSource = {
          roundId: rounds[roundNumber - 2].id,
          gameNumber: bottomSourceGame + (totalGames - prevRoundGames),
          position: 'winner',
        };
      }

      games.push(game);
    }

    rounds.push({
      id: roundId,
      bracketId,
      roundNumber,
      name: getRoundName(gamesInRound, bracketSize / 2),
      games,
    });

    totalGames += gamesInRound;
    gamesInRound /= 2;
    roundNumber++;
  }

  return rounds;
}

function generateDoubleEliminationBracket(
  bracketId: string,
  teamCount: number,
  seeds?: string[]
): BracketRound[] {
  // Generate winners bracket
  const winnersBracket = generateSingleEliminationBracket(bracketId, teamCount, seeds);

  // Mark as winners bracket
  winnersBracket.forEach(round => {
    round.name = `Winners ${round.name}`;
  });

  // Generate losers bracket
  const losersBracket: BracketRound[] = [];
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamCount)));
  let losersRound = 1;
  let gamesInRound = bracketSize / 4;

  while (gamesInRound >= 1) {
    const roundId = generateId();
    const games: BracketGame[] = [];

    for (let i = 0; i < gamesInRound; i++) {
      games.push({
        id: generateId(),
        roundId,
        gameNumber: i + 1,
        status: 'pending',
        // Sources would be set based on loser bracket rules
      });
    }

    losersBracket.push({
      id: roundId,
      bracketId,
      roundNumber: winnersBracket.length + losersRound,
      name: `Losers Round ${losersRound}`,
      games,
    });

    losersRound++;
    if (losersRound % 2 === 0) {
      gamesInRound /= 2;
    }
  }

  // Championship round
  const championshipId = generateId();
  const championshipRound: BracketRound = {
    id: championshipId,
    bracketId,
    roundNumber: winnersBracket.length + losersBracket.length + 1,
    name: 'Championship',
    games: [
      {
        id: generateId(),
        roundId: championshipId,
        gameNumber: 1,
        status: 'pending',
      },
    ],
  };

  return [...winnersBracket, ...losersBracket, championshipRound];
}

function getRoundName(gamesInRound: number, totalFirstRoundGames: number): string {
  if (gamesInRound === 1) return 'Championship';
  if (gamesInRound === 2) return 'Semifinals';
  if (gamesInRound === 4) return 'Quarterfinals';
  if (gamesInRound === totalFirstRoundGames) return 'First Round';

  return `Round of ${gamesInRound * 2}`;
}

// ===========================================
// POOL PLAY
// ===========================================

export interface PoolPlayOptions {
  teamIds: string[];
  poolCount: number;
  scheduleId: string;
}

export interface Pool {
  id: string;
  name: string;
  teams: string[];
  games: ScheduledGame[];
}

export function generatePoolPlay(options: PoolPlayOptions): Pool[] {
  const { teamIds, poolCount, scheduleId } = options;

  // Distribute teams to pools (snake draft for balance)
  const pools: Pool[] = [];
  for (let i = 0; i < poolCount; i++) {
    pools.push({
      id: generateId(),
      name: `Pool ${String.fromCharCode(65 + i)}`, // A, B, C...
      teams: [],
      games: [],
    });
  }

  // Snake draft assignment
  let direction = 1;
  let poolIndex = 0;

  for (const teamId of teamIds) {
    pools[poolIndex].teams.push(teamId);

    poolIndex += direction;
    if (poolIndex >= poolCount || poolIndex < 0) {
      direction *= -1;
      poolIndex += direction;
    }
  }

  // Generate round-robin games for each pool
  for (const pool of pools) {
    const matchups = generateRoundRobinMatchups(pool.teams);

    pool.games = matchups.map(([home, away]) => ({
      id: generateId(),
      scheduleId,
      homeTeamId: home,
      awayTeamId: away,
      scheduledAt: new Date(), // Would be set by scheduler
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'scheduled' as const,
    }));
  }

  return pools;
}
