// Media Upload Service

import type {
  MediaType,
  MediaItem,
  MediaMetadata,
  UploadRequest,
  UploadResponse,
} from './types';
import { StorageService, generateStorageKey } from './storage';

// Generate unique ID
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get file extension from mime type
function getExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'application/pdf': 'pdf',
  };

  return mimeToExt[mimeType] || 'bin';
}

// Determine media type from mime type
function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

// Validate upload request
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  // Documents
  'application/pdf',
];

const MAX_FILE_SIZES: Record<MediaType, number> = {
  photo: 50 * 1024 * 1024, // 50MB
  video: 5 * 1024 * 1024 * 1024, // 5GB
  document: 100 * 1024 * 1024, // 100MB
};

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUpload(request: UploadRequest): UploadValidationResult {
  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(request.mimeType)) {
    return { valid: false, error: `File type ${request.mimeType} is not allowed` };
  }

  // Check file size
  const type = getMediaType(request.mimeType);
  const maxSize = MAX_FILE_SIZES[type];

  if (request.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  return { valid: true };
}

export class UploadService {
  private storage: StorageService;
  private onMediaCreated?: (media: MediaItem) => Promise<void>;

  constructor(
    storage: StorageService,
    options?: {
      onMediaCreated?: (media: MediaItem) => Promise<void>;
    }
  ) {
    this.storage = storage;
    this.onMediaCreated = options?.onMediaCreated;
  }

  // Create a presigned URL for client-side upload
  async createUploadUrl(request: UploadRequest): Promise<UploadResponse> {
    // Validate
    const validation = validateUpload(request);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const mediaId = generateId();
    const extension = getExtension(request.mimeType);
    const key = generateStorageKey(mediaId, request.type, 'original', extension);

    // Get presigned URL
    const uploadUrl = await this.storage.getUploadUrl(key, request.mimeType);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Create pending media record
    const media: MediaItem = {
      id: mediaId,
      type: request.type,
      status: 'pending',
      url: '', // Will be set after processing
      metadata: {
        size: request.size,
        mimeType: request.mimeType,
        originalFilename: request.filename,
      },
      uploadedBy: request.uploadedBy,
      teamId: request.teamId,
      gameId: request.gameId,
      playerId: request.playerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store media record (callback to save to database)
    if (this.onMediaCreated) {
      await this.onMediaCreated(media);
    }

    return {
      mediaId,
      uploadUrl,
      expiresAt,
    };
  }

  // Confirm upload completed and trigger processing
  async confirmUpload(mediaId: string): Promise<MediaItem> {
    // TODO: Get media from database
    // For now, return mock data

    return {
      id: mediaId,
      type: 'photo',
      status: 'processing',
      url: this.storage.getPublicUrl(generateStorageKey(mediaId, 'photo', 'original', 'jpg')),
      metadata: {
        size: 0,
        mimeType: 'image/jpeg',
        originalFilename: 'photo.jpg',
      },
      uploadedBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Direct upload from server (for background processing)
  async uploadDirect(
    buffer: Buffer,
    request: UploadRequest
  ): Promise<MediaItem> {
    // Validate
    const validation = validateUpload(request);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const mediaId = generateId();
    const extension = getExtension(request.mimeType);
    const key = generateStorageKey(mediaId, request.type, 'original', extension);

    // Upload to storage
    await this.storage.upload(key, buffer, request.mimeType);

    // Create media record
    const media: MediaItem = {
      id: mediaId,
      type: request.type,
      status: 'processing',
      url: this.storage.getPublicUrl(key),
      metadata: {
        size: buffer.length,
        mimeType: request.mimeType,
        originalFilename: request.filename,
      },
      uploadedBy: request.uploadedBy,
      teamId: request.teamId,
      gameId: request.gameId,
      playerId: request.playerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.onMediaCreated) {
      await this.onMediaCreated(media);
    }

    return media;
  }

  // Delete media and all variants
  async deleteMedia(mediaId: string, type: MediaType): Promise<void> {
    const prefix = `media/${type}s/${mediaId}/`;
    const keys = await this.storage.list(prefix);
    await this.storage.deleteMany(keys);
  }
}

export function createUploadService(
  storage: StorageService,
  options?: {
    onMediaCreated?: (media: MediaItem) => Promise<void>;
  }
): UploadService {
  return new UploadService(storage, options);
}
