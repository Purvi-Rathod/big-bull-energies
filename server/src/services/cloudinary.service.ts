import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { AppError } from '../utils/AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dygdftjr8',
  api_key: process.env.CLOUDINARY_API_KEY || '488932968133113',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7MERESwtu5CfjT-ddB3bb22CQaQ',
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  created_at: string;
}

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer
 * @param folder - Folder path in Cloudinary (e.g., 'gallery/photos')
 * @param resourceType - Type of resource: 'image', 'video', 'auto', or 'raw'
 * @param options - Additional Cloudinary upload options
 * @returns Cloudinary upload result
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'gallery',
  resourceType: 'image' | 'video' | 'auto' | 'raw' = 'auto',
  options: {
    publicId?: string;
    transformation?: any;
    overwrite?: boolean;
    invalidate?: boolean;
  } = {}
): Promise<CloudinaryUploadResult> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: options.publicId,
          transformation: options.transformation,
          overwrite: options.overwrite ?? false,
          invalidate: options.invalidate ?? true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new AppError(`Failed to upload to Cloudinary: ${error.message}`, 500));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              format: result.format || '',
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              resource_type: result.resource_type as 'image' | 'video' | 'raw' | 'auto',
              created_at: result.created_at || new Date().toISOString(),
            });
          } else {
            reject(new AppError('Cloudinary upload returned no result', 500));
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  } catch (error: any) {
    console.error('Cloudinary upload exception:', error);
    throw new AppError(`Failed to upload to Cloudinary: ${error.message}`, 500);
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file in Cloudinary
 * @param resourceType - Type of resource: 'image', 'video', 'raw', or 'auto'
 * @returns Deletion result
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new AppError(`Failed to delete from Cloudinary: ${result.result}`, 500);
    }
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw new AppError(`Failed to delete from Cloudinary: ${error.message}`, 500);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null if not a Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Match Cloudinary URL pattern: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    const match = url.match(/\/upload\/[^\/]+\/(.+?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Generate optimized image URL with transformations
 * @param publicId - Public ID of the image
 * @param transformations - Cloudinary transformation options
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  } = {}
): string => {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
};

export default cloudinary;
