// Video Player Configuration and Components
// For use with Mux Player in React/React Native

import type { PlaybackInfo } from './types';

// Player configuration options
export interface PlayerOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  poster?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  startTime?: number;
  streamType?: 'on-demand' | 'live' | 'll-live';
  defaultShowRemainingTime?: boolean;
  thumbnailTime?: number;
}

// Generate Mux Player embed code
export function generateMuxPlayerEmbed(
  playbackId: string,
  options: PlayerOptions = {}
): string {
  const attrs = [
    `playback-id="${playbackId}"`,
    options.autoPlay ? 'autoplay' : '',
    options.muted ? 'muted' : '',
    options.loop ? 'loop' : '',
    options.controls !== false ? '' : 'controls="false"',
    options.streamType ? `stream-type="${options.streamType}"` : '',
    options.primaryColor ? `primary-color="${options.primaryColor}"` : '',
    options.accentColor ? `accent-color="${options.accentColor}"` : '',
    options.startTime ? `start-time="${options.startTime}"` : '',
  ].filter(Boolean).join(' ');

  return `<mux-player ${attrs}></mux-player>`;
}

// React component props type
export interface MuxPlayerProps extends PlayerOptions {
  playbackId: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Generate HLS.js configuration
export function generateHlsConfig(
  playbackId: string,
  options: {
    lowLatency?: boolean;
    maxBufferLength?: number;
    liveSyncDuration?: number;
  } = {}
): object {
  const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;

  return {
    src: hlsUrl,
    type: 'application/x-mpegURL',
    hls: {
      lowLatencyMode: options.lowLatency || false,
      maxBufferLength: options.maxBufferLength || 30,
      liveSyncDuration: options.liveSyncDuration || 3,
      liveMaxLatencyDuration: 10,
      enableWorker: true,
      startLevel: -1, // Auto quality selection
    },
  };
}

// Thumbnail generation
export function getThumbnailUrl(
  playbackId: string,
  options: {
    time?: number;
    width?: number;
    height?: number;
    fitMode?: 'preserve' | 'stretch' | 'crop' | 'smartcrop' | 'pad';
  } = {}
): string {
  const params = new URLSearchParams();

  if (options.time !== undefined) params.set('time', options.time.toString());
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.fitMode) params.set('fit_mode', options.fitMode);

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ''}`;
}

// Animated GIF generation
export function getGifUrl(
  playbackId: string,
  options: {
    start?: number;
    end?: number;
    width?: number;
    fps?: number;
  } = {}
): string {
  const params = new URLSearchParams();

  if (options.start !== undefined) params.set('start', options.start.toString());
  if (options.end !== undefined) params.set('end', options.end.toString());
  if (options.width) params.set('width', options.width.toString());
  if (options.fps) params.set('fps', options.fps.toString());

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/animated.gif${queryString ? `?${queryString}` : ''}`;
}

// Storyboard/sprite sheet for seek preview
export function getStoryboardUrl(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/storyboard.vtt`;
}

// Quality levels for adaptive streaming
export const QUALITY_LEVELS = {
  auto: -1,
  '360p': 0,
  '480p': 1,
  '720p': 2,
  '1080p': 3,
  '1440p': 4,
  '4k': 5,
};

// Player events enum
export enum PlayerEvent {
  PLAY = 'play',
  PAUSE = 'pause',
  ENDED = 'ended',
  SEEKING = 'seeking',
  SEEKED = 'seeked',
  TIMEUPDATE = 'timeupdate',
  LOADSTART = 'loadstart',
  LOADEDDATA = 'loadeddata',
  CANPLAY = 'canplay',
  ERROR = 'error',
  FULLSCREEN_CHANGE = 'fullscreenchange',
  QUALITY_CHANGE = 'qualitychange',
}

// Caption/subtitle track
export interface TextTrack {
  label: string;
  language: string;
  src: string;
  kind: 'subtitles' | 'captions' | 'descriptions';
  default?: boolean;
}

// Add captions URL generation
export function getCaptionsUrl(assetId: string, trackId: string): string {
  return `https://stream.mux.com/${assetId}/text/${trackId}.vtt`;
}
