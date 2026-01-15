// AI Highlights Types

export type Sport =
  | 'baseball'
  | 'softball'
  | 'basketball'
  | 'soccer'
  | 'football'
  | 'volleyball';

export type HighlightType =
  // Baseball/Softball
  | 'home_run'
  | 'strikeout'
  | 'great_catch'
  | 'double_play'
  | 'base_hit'

  // Basketball
  | 'three_pointer'
  | 'dunk'
  | 'block'
  | 'steal'
  | 'alley_oop'
  | 'buzzer_beater'

  // Soccer
  | 'goal'
  | 'save'
  | 'assist'
  | 'free_kick'
  | 'penalty'

  // Football
  | 'touchdown'
  | 'interception'
  | 'sack'
  | 'long_pass'
  | 'field_goal'

  // Volleyball
  | 'kill'
  | 'ace'
  | 'block'
  | 'dig'
  | 'spike'

  // General
  | 'celebration'
  | 'close_play'
  | 'big_moment';

export type HighlightQuality = 'low' | 'medium' | 'high' | 'exceptional';

export interface Highlight {
  id: string;
  gameId: string;
  videoId: string;
  type: HighlightType;
  quality: HighlightQuality;

  // Timing
  startTime: number; // seconds into video
  endTime: number;
  duration: number;

  // Content
  title: string;
  description: string;
  playerId?: string;
  playerName?: string;
  teamId?: string;

  // Scores/Context
  period?: number;
  gameTime?: string;
  homeScore?: number;
  awayScore?: number;

  // AI Confidence
  confidence: number; // 0-1

  // Generated assets
  clipUrl?: string;
  thumbnailUrl?: string;
  gifUrl?: string;

  // Metadata
  createdAt: Date;
  tags: string[];
}

export interface HighlightDetectionResult {
  highlights: DetectedHighlight[];
  processingTime: number;
  framesAnalyzed: number;
}

export interface DetectedHighlight {
  type: HighlightType;
  startTime: number;
  endTime: number;
  confidence: number;
  metadata: Record<string, any>;
}

export interface GameAnalysisRequest {
  gameId: string;
  videoUrl: string;
  sport: Sport;
  homeTeamName: string;
  awayTeamName: string;
  playerRoster?: { id: string; name: string; number: number }[];
}

export interface HighlightReelConfig {
  maxDuration: number; // seconds
  maxClips: number;
  includeTypes?: HighlightType[];
  excludeTypes?: HighlightType[];
  minConfidence: number;
  sortBy: 'chronological' | 'importance' | 'excitement';
  transitionDuration: number; // seconds
}

export interface HighlightReel {
  id: string;
  gameId: string;
  title: string;
  highlights: Highlight[];
  totalDuration: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

// Sport-specific highlight mappings
export const SPORT_HIGHLIGHT_TYPES: Record<Sport, HighlightType[]> = {
  baseball: ['home_run', 'strikeout', 'great_catch', 'double_play', 'base_hit', 'celebration'],
  softball: ['home_run', 'strikeout', 'great_catch', 'double_play', 'base_hit', 'celebration'],
  basketball: ['three_pointer', 'dunk', 'block', 'steal', 'alley_oop', 'buzzer_beater', 'celebration'],
  soccer: ['goal', 'save', 'assist', 'free_kick', 'penalty', 'celebration'],
  football: ['touchdown', 'interception', 'sack', 'long_pass', 'field_goal', 'celebration'],
  volleyball: ['kill', 'ace', 'block', 'dig', 'spike', 'celebration'],
};

// Highlight importance weights (for sorting/prioritization)
export const HIGHLIGHT_IMPORTANCE: Record<HighlightType, number> = {
  // Highest importance
  buzzer_beater: 100,
  touchdown: 95,
  home_run: 90,
  goal: 90,
  dunk: 85,

  // High importance
  three_pointer: 80,
  interception: 80,
  double_play: 75,
  great_catch: 75,
  penalty: 75,

  // Medium importance
  alley_oop: 70,
  block: 65,
  save: 65,
  sack: 65,
  ace: 65,
  kill: 60,
  strikeout: 60,
  field_goal: 60,

  // Lower importance
  steal: 55,
  long_pass: 55,
  free_kick: 50,
  base_hit: 50,
  dig: 50,
  spike: 50,
  assist: 45,

  // Celebrations/reactions
  celebration: 40,
  close_play: 40,
  big_moment: 35,
};
