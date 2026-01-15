// Mux Live Streaming Integration

import Mux from '@mux/mux-node';
import type {
  MuxConfig,
  LiveStream,
  StreamConfig,
  StreamCredentials,
  PlaybackInfo,
  StreamStats,
  RecordingAsset,
} from './types';

// Generate unique ID
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

export class MuxStreamingService {
  private mux: Mux;

  constructor(config: MuxConfig) {
    this.mux = new Mux({
      tokenId: config.tokenId,
      tokenSecret: config.tokenSecret,
    });
  }

  // Create a new live stream
  async createStream(config: StreamConfig): Promise<LiveStream> {
    const liveStream = await this.mux.video.liveStreams.create({
      playback_policy: [config.isPublic ? 'public' : 'signed'],
      new_asset_settings: {
        playback_policy: [config.isPublic ? 'public' : 'signed'],
      },
      latency_mode: config.lowLatency ? 'low' : 'standard',
      reconnect_window: 60, // 60 seconds reconnect window
      max_continuous_duration: 43200, // 12 hours max
    });

    const playbackId = liveStream.playback_ids?.[0]?.id;

    return {
      id: generateId(),
      gameId: config.gameId,
      teamId: config.teamId,
      title: config.title,
      description: config.description,
      status: 'idle',
      isPublic: config.isPublic,
      enableChat: config.enableChat,
      streamKey: liveStream.stream_key,
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
      playbackUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : undefined,
      playbackId,
      viewerCount: 0,
      peakViewerCount: 0,
      duration: 0,
      createdAt: new Date(),
      hasRecording: true,
    };
  }

  // Get stream credentials for broadcasting
  async getStreamCredentials(muxStreamId: string): Promise<StreamCredentials> {
    const liveStream = await this.mux.video.liveStreams.retrieve(muxStreamId);

    return {
      streamKey: liveStream.stream_key || '',
      rtmpUrl: 'rtmp://global-live.mux.com:5222/app',
      rtmpsUrl: 'rtmps://global-live.mux.com:443/app',
    };
  }

  // Get playback info for viewers
  async getPlaybackInfo(muxStreamId: string): Promise<PlaybackInfo> {
    const liveStream = await this.mux.video.liveStreams.retrieve(muxStreamId);
    const playbackId = liveStream.playback_ids?.[0]?.id;

    if (!playbackId) {
      throw new Error('No playback ID available');
    }

    return {
      playbackId,
      playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      hlsUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
      posterUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`,
    };
  }

  // Get stream stats
  async getStreamStats(muxStreamId: string): Promise<StreamStats> {
    const liveStream = await this.mux.video.liveStreams.retrieve(muxStreamId);

    return {
      viewerCount: 0, // Would need Mux Data for real-time viewer count
      peakViewerCount: 0,
      duration: 0,
    };
  }

  // Stop/disable a stream
  async stopStream(muxStreamId: string): Promise<void> {
    await this.mux.video.liveStreams.disable(muxStreamId);
  }

  // Reset stream key (if compromised)
  async resetStreamKey(muxStreamId: string): Promise<string> {
    const liveStream = await this.mux.video.liveStreams.resetStreamKey(muxStreamId);
    return liveStream.stream_key || '';
  }

  // Delete a stream
  async deleteStream(muxStreamId: string): Promise<void> {
    await this.mux.video.liveStreams.delete(muxStreamId);
  }

  // List recordings for a stream
  async getRecordings(muxStreamId: string): Promise<RecordingAsset[]> {
    // List assets that came from this live stream
    const assets = await this.mux.video.assets.list({
      live_stream_id: muxStreamId,
    });

    return assets.data.map(asset => ({
      id: asset.id,
      streamId: muxStreamId,
      status: asset.status as RecordingAsset['status'],
      duration: asset.duration || 0,
      playbackUrl: asset.playback_ids?.[0]?.id
        ? `https://stream.mux.com/${asset.playback_ids[0].id}.m3u8`
        : undefined,
      downloadUrl: asset.master?.url,
      createdAt: new Date(asset.created_at || Date.now()),
    }));
  }

  // Create signed playback token (for private streams)
  createSignedPlaybackToken(
    playbackId: string,
    options: {
      expiresIn?: number; // seconds
      type?: 'video' | 'thumbnail' | 'gif' | 'storyboard';
    } = {}
  ): string {
    // In production, use @mux/mux-node's JWT signing
    // This is a placeholder
    return `signed_token_for_${playbackId}`;
  }

  // Handle Mux webhooks
  async handleWebhook(
    payload: any,
    signature: string,
    secret: string
  ): Promise<{ type: string; data: any }> {
    // Verify webhook signature
    // In production, use Mux's webhook verification

    const { type, data } = payload;

    switch (type) {
      case 'video.live_stream.active':
        return { type: 'stream.active', data };

      case 'video.live_stream.idle':
        return { type: 'stream.idle', data };

      case 'video.live_stream.connected':
        return { type: 'stream.started', data };

      case 'video.live_stream.disconnected':
        return { type: 'stream.ended', data };

      case 'video.asset.ready':
        return { type: 'recording.ready', data };

      default:
        return { type, data };
    }
  }
}

export function createMuxStreamingService(config: MuxConfig): MuxStreamingService {
  return new MuxStreamingService(config);
}

// Create from environment variables
export function createMuxStreamingServiceFromEnv(): MuxStreamingService {
  const config: MuxConfig = {
    tokenId: process.env.MUX_TOKEN_ID || '',
    tokenSecret: process.env.MUX_TOKEN_SECRET || '',
    webhookSecret: process.env.MUX_WEBHOOK_SECRET,
  };

  return new MuxStreamingService(config);
}
