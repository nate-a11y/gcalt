// Highlight Reel Generator
// Creates compilations of the best moments from a game

import type {
  Highlight,
  HighlightReel,
  HighlightReelConfig,
  HighlightType,
  HIGHLIGHT_IMPORTANCE,
} from './types';

// Generate unique ID
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===========================================
// REEL GENERATION
// ===========================================

export interface ReelGeneratorOptions {
  defaultTransitionDuration: number;
  minClipDuration: number;
  maxClipDuration: number;
  paddingBefore: number; // seconds before highlight
  paddingAfter: number; // seconds after highlight
}

export class HighlightReelGenerator {
  private options: ReelGeneratorOptions;

  constructor(options: Partial<ReelGeneratorOptions> = {}) {
    this.options = {
      defaultTransitionDuration: options.defaultTransitionDuration ?? 0.5,
      minClipDuration: options.minClipDuration ?? 3,
      maxClipDuration: options.maxClipDuration ?? 15,
      paddingBefore: options.paddingBefore ?? 2,
      paddingAfter: options.paddingAfter ?? 3,
    };
  }

  // Generate a highlight reel from detected highlights
  generateReel(
    gameId: string,
    highlights: Highlight[],
    config: HighlightReelConfig
  ): HighlightReel {
    // Filter highlights
    let filteredHighlights = highlights.filter(
      h => h.confidence >= config.minConfidence
    );

    // Apply type filters
    if (config.includeTypes && config.includeTypes.length > 0) {
      filteredHighlights = filteredHighlights.filter(
        h => config.includeTypes!.includes(h.type)
      );
    }

    if (config.excludeTypes && config.excludeTypes.length > 0) {
      filteredHighlights = filteredHighlights.filter(
        h => !config.excludeTypes!.includes(h.type)
      );
    }

    // Sort highlights
    filteredHighlights = this.sortHighlights(filteredHighlights, config.sortBy);

    // Select highlights that fit within duration
    const selectedHighlights = this.selectHighlights(
      filteredHighlights,
      config.maxDuration,
      config.maxClips,
      config.transitionDuration
    );

    // For chronological order, re-sort by time
    if (config.sortBy === 'chronological') {
      selectedHighlights.sort((a, b) => a.startTime - b.startTime);
    }

    // Calculate total duration
    const totalDuration = this.calculateTotalDuration(
      selectedHighlights,
      config.transitionDuration
    );

    return {
      id: generateId(),
      gameId,
      title: `Game Highlights`,
      highlights: selectedHighlights,
      totalDuration,
      createdAt: new Date(),
    };
  }

  // Sort highlights based on criteria
  private sortHighlights(
    highlights: Highlight[],
    sortBy: HighlightReelConfig['sortBy']
  ): Highlight[] {
    switch (sortBy) {
      case 'importance':
        return [...highlights].sort((a, b) => {
          const importanceA = HIGHLIGHT_IMPORTANCE[a.type] || 0;
          const importanceB = HIGHLIGHT_IMPORTANCE[b.type] || 0;
          return importanceB - importanceA;
        });

      case 'excitement':
        return [...highlights].sort((a, b) => {
          // Combine importance with confidence
          const scoreA = (HIGHLIGHT_IMPORTANCE[a.type] || 0) * a.confidence;
          const scoreB = (HIGHLIGHT_IMPORTANCE[b.type] || 0) * b.confidence;
          return scoreB - scoreA;
        });

      case 'chronological':
      default:
        return [...highlights].sort((a, b) => a.startTime - b.startTime);
    }
  }

  // Select highlights that fit within constraints
  private selectHighlights(
    highlights: Highlight[],
    maxDuration: number,
    maxClips: number,
    transitionDuration: number
  ): Highlight[] {
    const selected: Highlight[] = [];
    let currentDuration = 0;

    for (const highlight of highlights) {
      if (selected.length >= maxClips) break;

      const clipDuration = Math.min(
        Math.max(highlight.duration, this.options.minClipDuration),
        this.options.maxClipDuration
      );

      const addedDuration = clipDuration + (selected.length > 0 ? transitionDuration : 0);

      if (currentDuration + addedDuration <= maxDuration) {
        selected.push(highlight);
        currentDuration += addedDuration;
      }
    }

    return selected;
  }

  // Calculate total reel duration
  private calculateTotalDuration(
    highlights: Highlight[],
    transitionDuration: number
  ): number {
    if (highlights.length === 0) return 0;

    const clipsDuration = highlights.reduce((sum, h) => {
      const clipDuration = Math.min(
        Math.max(h.duration, this.options.minClipDuration),
        this.options.maxClipDuration
      );
      return sum + clipDuration;
    }, 0);

    const transitionsDuration = (highlights.length - 1) * transitionDuration;

    return clipsDuration + transitionsDuration;
  }

  // Generate clip timings for video editing
  generateClipTimings(
    highlights: Highlight[],
    transitionDuration: number
  ): {
    highlightId: string;
    sourceStart: number;
    sourceEnd: number;
    reelStart: number;
    reelEnd: number;
  }[] {
    const timings = [];
    let currentReelTime = 0;

    for (let i = 0; i < highlights.length; i++) {
      const highlight = highlights[i];

      // Add padding to source times
      const sourceStart = Math.max(0, highlight.startTime - this.options.paddingBefore);
      const sourceEnd = highlight.endTime + this.options.paddingAfter;
      const clipDuration = sourceEnd - sourceStart;

      timings.push({
        highlightId: highlight.id,
        sourceStart,
        sourceEnd,
        reelStart: currentReelTime,
        reelEnd: currentReelTime + clipDuration,
      });

      currentReelTime += clipDuration + (i < highlights.length - 1 ? transitionDuration : 0);
    }

    return timings;
  }
}

// ===========================================
// PRESET CONFIGURATIONS
// ===========================================

export const REEL_PRESETS: Record<string, HighlightReelConfig> = {
  // Quick social media clip
  quick: {
    maxDuration: 30,
    maxClips: 3,
    minConfidence: 0.8,
    sortBy: 'importance',
    transitionDuration: 0.3,
  },

  // Standard game recap
  standard: {
    maxDuration: 120,
    maxClips: 10,
    minConfidence: 0.7,
    sortBy: 'excitement',
    transitionDuration: 0.5,
  },

  // Full game highlights
  extended: {
    maxDuration: 300,
    maxClips: 25,
    minConfidence: 0.6,
    sortBy: 'chronological',
    transitionDuration: 0.5,
  },

  // Offense-only highlights
  offense: {
    maxDuration: 120,
    maxClips: 15,
    includeTypes: [
      'home_run', 'touchdown', 'goal', 'dunk', 'three_pointer',
      'alley_oop', 'buzzer_beater', 'kill', 'spike', 'long_pass',
    ],
    minConfidence: 0.7,
    sortBy: 'importance',
    transitionDuration: 0.5,
  },

  // Defense-only highlights
  defense: {
    maxDuration: 120,
    maxClips: 15,
    includeTypes: [
      'strikeout', 'great_catch', 'double_play', 'block', 'steal',
      'interception', 'sack', 'save', 'dig',
    ],
    minConfidence: 0.7,
    sortBy: 'importance',
    transitionDuration: 0.5,
  },
};

export function createHighlightReelGenerator(
  options?: Partial<ReelGeneratorOptions>
): HighlightReelGenerator {
  return new HighlightReelGenerator(options);
}
