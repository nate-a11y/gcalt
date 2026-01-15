// Media Processing Service
// Handles image resizing, video transcoding, and thumbnail generation

import sharp from 'sharp';
import type { MediaItem, ImageVariant, ProcessingJob, IMAGE_VARIANTS } from './types';
import { StorageService, generateStorageKey } from './storage';

// Generate unique ID
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface ProcessingOptions {
  generateThumbnails?: boolean;
  generateVariants?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export class ImageProcessor {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  // Process an uploaded image
  async processImage(
    mediaId: string,
    variants: ImageVariant[] = []
  ): Promise<{ variant: string; url: string }[]> {
    const originalKey = generateStorageKey(mediaId, 'photo', 'original');

    // Find the original file
    const files = await this.storage.list(`media/photos/${mediaId}/`);
    const originalFile = files.find(f => f.includes('/original.'));

    if (!originalFile) {
      throw new Error('Original file not found');
    }

    // Download original
    const originalBuffer = await this.storage.download(originalFile);

    // Get image metadata
    const metadata = await sharp(originalBuffer).metadata();

    const results: { variant: string; url: string }[] = [];

    // Generate variants
    for (const variant of variants) {
      const key = generateStorageKey(mediaId, 'photo', variant.name, 'webp');

      // Resize and convert to WebP
      const processedBuffer = await sharp(originalBuffer)
        .resize(variant.width, variant.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: variant.quality })
        .toBuffer();

      // Upload variant
      await this.storage.upload(key, processedBuffer, 'image/webp');

      results.push({
        variant: variant.name,
        url: this.storage.getPublicUrl(key),
      });
    }

    return results;
  }

  // Generate thumbnail for an image
  async generateThumbnail(
    mediaId: string,
    size: number = 150
  ): Promise<string> {
    // Find original
    const files = await this.storage.list(`media/photos/${mediaId}/`);
    const originalFile = files.find(f => f.includes('/original.'));

    if (!originalFile) {
      throw new Error('Original file not found');
    }

    const originalBuffer = await this.storage.download(originalFile);

    // Create square thumbnail
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();

    const key = generateStorageKey(mediaId, 'photo', 'thumbnail', 'webp');
    await this.storage.upload(key, thumbnailBuffer, 'image/webp');

    return this.storage.getPublicUrl(key);
  }

  // Get image dimensions
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  // Auto-rotate based on EXIF data
  async autoRotate(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).rotate().toBuffer();
  }

  // Strip EXIF data (for privacy)
  async stripExif(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate() // Auto-rotate first based on EXIF
      .withMetadata({ orientation: undefined })
      .toBuffer();
  }
}

// Video processing stub (would use ffmpeg in production)
export class VideoProcessor {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  // Generate video thumbnail
  async generateThumbnail(mediaId: string): Promise<string> {
    // In production, this would use ffmpeg to extract a frame
    // For now, we'll return a placeholder approach

    // This is a stub - actual implementation would:
    // 1. Download video
    // 2. Use ffmpeg to extract frame at 1 second
    // 3. Process with sharp
    // 4. Upload thumbnail

    console.log(`Video thumbnail generation for ${mediaId} - requires ffmpeg`);

    return '';
  }

  // Get video metadata
  async getVideoMetadata(mediaId: string): Promise<{
    duration: number;
    width: number;
    height: number;
    codec: string;
    bitrate: number;
  }> {
    // In production, this would use ffprobe
    // Stub implementation

    return {
      duration: 0,
      width: 0,
      height: 0,
      codec: 'unknown',
      bitrate: 0,
    };
  }

  // Transcode video to different quality levels
  async transcode(
    mediaId: string,
    variants: { name: string; width: number; height: number; bitrate: string }[]
  ): Promise<{ variant: string; url: string }[]> {
    // In production, this would use ffmpeg for transcoding
    // Or better, use a service like Mux or Cloudflare Stream

    console.log(`Video transcoding for ${mediaId} - requires ffmpeg or video service`);

    return [];
  }
}

// Processing queue manager
export class ProcessingQueue {
  private jobs: Map<string, ProcessingJob> = new Map();
  private imageProcessor: ImageProcessor;
  private videoProcessor: VideoProcessor;
  private onJobComplete?: (job: ProcessingJob) => Promise<void>;

  constructor(
    storage: StorageService,
    options?: {
      onJobComplete?: (job: ProcessingJob) => Promise<void>;
    }
  ) {
    this.imageProcessor = new ImageProcessor(storage);
    this.videoProcessor = new VideoProcessor(storage);
    this.onJobComplete = options?.onJobComplete;
  }

  // Add a job to the queue
  async addJob(
    mediaId: string,
    type: ProcessingJob['type']
  ): Promise<ProcessingJob> {
    const job: ProcessingJob = {
      id: generateId(),
      mediaId,
      type,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);

    // Process immediately (in production, this would use a real queue)
    this.processJob(job.id);

    return job;
  }

  // Process a job
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'processing';

    try {
      switch (job.type) {
        case 'thumbnail':
          // Determine if image or video
          await this.imageProcessor.generateThumbnail(job.mediaId);
          break;

        case 'transcode':
          // Video transcoding
          await this.videoProcessor.transcode(job.mediaId, []);
          break;

        case 'compress':
          // Image compression
          await this.imageProcessor.processImage(job.mediaId, [
            { name: 'compressed', width: 2000, height: 2000, quality: 85 },
          ]);
          break;
      }

      job.status = 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
    }

    if (this.onJobComplete) {
      await this.onJobComplete(job);
    }
  }

  // Get job status
  getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs for a media item
  getJobsForMedia(mediaId: string): ProcessingJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.mediaId === mediaId
    );
  }
}

export function createProcessingQueue(
  storage: StorageService,
  options?: {
    onJobComplete?: (job: ProcessingJob) => Promise<void>;
  }
): ProcessingQueue {
  return new ProcessingQueue(storage, options);
}
