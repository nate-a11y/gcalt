// Live Streaming Types

export type StreamStatus = 'idle' | 'starting' | 'active' | 'stopping' | 'stopped' | 'error';

export interface StreamConfig {
  gameId: string;
  teamId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  enableChat: boolean;
  enableDVR: boolean;
  lowLatency: boolean;
}

export interface LiveStream {
  id: string;
  gameId: string;
  teamId: string;
  title: string;
  description?: string;
  status: StreamStatus;
  isPublic: boolean;
  enableChat: boolean;

  // Streaming URLs
  streamKey?: string;
  rtmpUrl?: string;
  playbackUrl?: string;
  playbackId?: string;

  // Stats
  viewerCount: number;
  peakViewerCount: number;
  duration: number; // seconds

  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;

  // Recording
  hasRecording: boolean;
  recordingUrl?: string;
  recordingDuration?: number;
}

export interface StreamCredentials {
  streamKey: string;
  rtmpUrl: string;
  rtmpsUrl: string;
}

export interface PlaybackInfo {
  playbackId: string;
  playbackUrl: string;
  hlsUrl: string;
  thumbnailUrl?: string;
  posterUrl?: string;
}

export interface StreamStats {
  viewerCount: number;
  peakViewerCount: number;
  duration: number;
  bitrate?: number;
  fps?: number;
  resolution?: string;
}

export interface StreamEvent {
  type: 'stream.started' | 'stream.active' | 'stream.idle' | 'stream.ended' | 'stream.error';
  streamId: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export interface RecordingAsset {
  id: string;
  streamId: string;
  status: 'preparing' | 'ready' | 'errored';
  duration: number;
  playbackUrl?: string;
  downloadUrl?: string;
  createdAt: Date;
}

// Mux-specific types
export interface MuxConfig {
  tokenId: string;
  tokenSecret: string;
  webhookSecret?: string;
}

export interface MuxLiveStream {
  id: string;
  stream_key: string;
  status: string;
  playback_ids: { id: string; policy: string }[];
  new_asset_settings: { playback_policy: string[] };
  created_at: string;
  max_continuous_duration: number;
  latency_mode: string;
  reconnect_window: number;
}

export interface MuxAsset {
  id: string;
  status: string;
  duration: number;
  playback_ids: { id: string; policy: string }[];
  created_at: string;
}
