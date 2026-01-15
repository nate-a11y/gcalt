// League and Tournament Types

export type Sport =
  | 'baseball'
  | 'softball'
  | 'basketball'
  | 'soccer'
  | 'football'
  | 'volleyball'
  | 'lacrosse'
  | 'hockey';

export type LeagueType = 'recreational' | 'competitive' | 'travel' | 'school';

export type TournamentFormat =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'pool_play'
  | 'pool_plus_bracket';

export type AgeGroup =
  | '6U' | '8U' | '10U' | '12U' | '14U' | '16U' | '18U'
  | 'varsity' | 'jv' | 'freshman'
  | 'adult' | 'senior';

// ===========================================
// LEAGUE
// ===========================================

export interface League {
  id: string;
  name: string;
  sport: Sport;
  type: LeagueType;
  ageGroups: AgeGroup[];
  description?: string;

  // Organization
  organizationId?: string;
  organizationName?: string;

  // Location
  city: string;
  state: string;
  country: string;
  timezone: string;

  // Seasons
  currentSeasonId?: string;

  // Settings
  settings: LeagueSettings;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueSettings {
  // Game rules
  gameDuration: number; // minutes
  periodsPerGame: number;
  overtimeRules?: string;

  // Standings
  standingsFormat: 'wins' | 'points' | 'percentage';
  pointsForWin: number;
  pointsForLoss: number;
  pointsForTie: number;
  pointsForOTWin?: number;
  pointsForOTLoss?: number;

  // Tiebreakers (in order)
  tiebreakers: TiebreakerRule[];

  // Playoffs
  playoffTeams: number;
  playoffFormat: TournamentFormat;
}

export type TiebreakerRule =
  | 'head_to_head'
  | 'point_differential'
  | 'points_for'
  | 'points_against'
  | 'wins'
  | 'division_record'
  | 'common_opponents'
  | 'coin_flip';

// ===========================================
// SEASON
// ===========================================

export interface Season {
  id: string;
  leagueId: string;
  name: string;
  year: number;

  // Dates
  registrationStart: Date;
  registrationEnd: Date;
  seasonStart: Date;
  seasonEnd: Date;
  playoffStart?: Date;
  playoffEnd?: Date;

  // Structure
  divisions: Division[];

  // Status
  status: 'upcoming' | 'registration' | 'active' | 'playoffs' | 'completed';

  createdAt: Date;
  updatedAt: Date;
}

export interface Division {
  id: string;
  seasonId: string;
  name: string;
  ageGroup: AgeGroup;
  teams: string[]; // Team IDs
  scheduleId?: string;
}

// ===========================================
// STANDINGS
// ===========================================

export interface TeamStanding {
  teamId: string;
  teamName: string;
  divisionId: string;

  // Record
  wins: number;
  losses: number;
  ties: number;
  overtimeWins: number;
  overtimeLosses: number;

  // Points (for point-based standings)
  points: number;

  // Differential
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;

  // Percentages
  winPercentage: number;

  // Streaks
  streak: string; // "W3", "L2", etc.
  last5: string; // "WWLWW"

  // Calculated
  rank: number;
  gamesBack: number;
  clinched?: 'playoff' | 'bye' | 'division' | 'eliminated';
}

export interface Standings {
  seasonId: string;
  divisionId?: string;
  lastUpdated: Date;
  teams: TeamStanding[];
}

// ===========================================
// SCHEDULE
// ===========================================

export interface Schedule {
  id: string;
  seasonId: string;
  divisionId?: string;
  name: string;
  games: ScheduledGame[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledGame {
  id: string;
  scheduleId: string;
  week?: number;
  round?: number;

  // Teams
  homeTeamId: string;
  awayTeamId: string;

  // Date/Time
  scheduledAt: Date;
  timezone: string;

  // Location
  fieldId?: string;
  fieldName?: string;
  address?: string;

  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

  // Result
  gameId?: string; // Link to actual game record
  homeScore?: number;
  awayScore?: number;
}

// ===========================================
// TOURNAMENT
// ===========================================

export interface Tournament {
  id: string;
  name: string;
  sport: Sport;
  ageGroups: AgeGroup[];
  format: TournamentFormat;
  description?: string;

  // Dates
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;

  // Location
  venue: string;
  city: string;
  state: string;
  address?: string;

  // Settings
  maxTeams: number;
  teamsRegistered: number;
  poolCount?: number;
  teamsPerPool?: number;
  gamesGuaranteed: number;
  entryFee?: number;

  // Structure
  pools?: TournamentPool[];
  bracket?: TournamentBracket;

  // Status
  status: 'upcoming' | 'registration' | 'seeding' | 'active' | 'completed';

  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentPool {
  id: string;
  tournamentId: string;
  name: string; // "Pool A", "Pool B"
  teams: string[];
  games: ScheduledGame[];
  standings: TeamStanding[];
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  format: TournamentFormat;
  rounds: BracketRound[];
}

export interface BracketRound {
  id: string;
  bracketId: string;
  roundNumber: number;
  name: string; // "Quarterfinals", "Semifinals", "Championship"
  games: BracketGame[];
}

export interface BracketGame {
  id: string;
  roundId: string;
  gameNumber: number;

  // Seeds/Teams
  topSeed?: number;
  bottomSeed?: number;
  topTeamId?: string;
  bottomTeamId?: string;

  // Source (for later rounds)
  topSource?: { roundId: string; gameNumber: number; position: 'winner' | 'loser' };
  bottomSource?: { roundId: string; gameNumber: number; position: 'winner' | 'loser' };

  // Schedule
  scheduledAt?: Date;
  fieldName?: string;

  // Result
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  topScore?: number;
  bottomScore?: number;
  winnerId?: string;
  loserId?: string;
}

// ===========================================
// REGISTRATION
// ===========================================

export interface TeamRegistration {
  id: string;
  tournamentId?: string;
  seasonId?: string;
  teamId: string;
  teamName: string;
  coachName: string;
  coachEmail: string;
  coachPhone: string;

  ageGroup: AgeGroup;
  division?: string;

  // Payment
  entryFee?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'waitlist';
  seed?: number;

  registeredAt: Date;
  approvedAt?: Date;
}
