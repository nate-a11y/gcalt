// Media Types

export type MediaType = 'photo' | 'video' | 'document';

export type MediaStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number; // For videos, in seconds
  size: number;
  mimeType: string;
  originalFilename: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  status: MediaStatus;
  url: string;
  thumbnailUrl?: string;
  metadata: MediaMetadata;
  uploadedBy: string;
  teamId?: string;
  gameId?: string;
  playerId?: string;
  eventId?: string;
  caption?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadRequest {
  filename: string;
  mimeType: string;
  size: number;
  type: MediaType;
  uploadedBy: string;
  teamId?: string;
  gameId?: string;
  playerId?: string;
}

export interface UploadResponse {
  mediaId: string;
  uploadUrl: string;
  expiresAt: Date;
}

export interface ProcessingJob {
  id: string;
  mediaId: string;
  type: 'thumbnail' | 'transcode' | 'compress';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
}

export interface ImageVariant {
  name: string;
  width: number;
  height: number;
  quality: number;
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  { name: 'thumbnail', width: 150, height: 150, quality: 80 },
  { name: 'small', width: 320, height: 320, quality: 80 },
  { name: 'medium', width: 640, height: 640, quality: 85 },
  { name: 'large', width: 1280, height: 1280, quality: 90 },
];

export interface VideoVariant {
  name: string;
  width: number;
  height: number;
  bitrate: string;
  codec: string;
}

export const VIDEO_VARIANTS: VideoVariant[] = [
  { name: '360p', width: 640, height: 360, bitrate: '800k', codec: 'h264' },
  { name: '720p', width: 1280, height: 720, bitrate: '2500k', codec: 'h264' },
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', codec: 'h264' },
];
