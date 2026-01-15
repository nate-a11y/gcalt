// Cloud Storage Integration (Cloudflare R2 / S3-compatible)

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageConfig, MediaType } from './types';

export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for R2
    });

    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl || `https://${config.bucket}.${config.region}.r2.cloudflarestorage.com`;
  }

  // Generate a presigned URL for uploads
  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  // Generate a presigned URL for downloads (private files)
  async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  // Get public URL for a file
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  // Upload a file directly
  async upload(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    await this.client.send(command);
  }

  // Download a file
  async download(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('Empty response body');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  // Delete a file
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  // Delete multiple files
  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.delete(key)));
  }

  // Check if a file exists
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  // Get file metadata
  async getMetadata(key: string): Promise<{
    contentType?: string;
    contentLength?: number;
    lastModified?: Date;
    metadata?: Record<string, string>;
  }> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }

  // List files with prefix
  async list(prefix: string, maxKeys: number = 1000): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await this.client.send(command);

    return (response.Contents || []).map(item => item.Key!).filter(Boolean);
  }
}

// Helper to generate storage keys
export function generateStorageKey(
  mediaId: string,
  type: MediaType,
  variant?: string,
  extension?: string
): string {
  const basePath = `media/${type}s/${mediaId}`;

  if (variant) {
    return `${basePath}/${variant}${extension ? `.${extension}` : ''}`;
  }

  return `${basePath}/original${extension ? `.${extension}` : ''}`;
}

// Helper to parse storage key
export function parseStorageKey(key: string): {
  mediaId: string;
  type: MediaType;
  variant: string;
  extension: string;
} | null {
  const match = key.match(/^media\/(photo|video|document)s\/([^/]+)\/([^.]+)\.?(.*)$/);

  if (!match) return null;

  return {
    type: match[1] as MediaType,
    mediaId: match[2],
    variant: match[3],
    extension: match[4] || '',
  };
}

// Create storage service from environment variables
export function createStorageService(): StorageService {
  const config: StorageConfig = {
    bucket: process.env.R2_BUCKET || 'sideline-media',
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    publicUrl: process.env.R2_PUBLIC_URL,
  };

  return new StorageService(config);
}
