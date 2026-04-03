// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

// Upload passport image for KYC
export const uploadPassport = async (
  imageBuffer: Buffer,
  folder: string = 'badekshop/kyc'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
        transformation: [
          { width: 1200, height: 900, crop: 'limit' }, // Limit file size while maintaining quality
          { quality: 'auto:good' }, // Auto optimize quality
        ],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload error: ${error.message}`));
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload failed: No result returned'));
          return;
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    // Create readable stream from buffer and pipe to upload
    const bufferStream = Readable.from(imageBuffer);
    bufferStream.pipe(uploadStream);

    // Handle stream errors
    bufferStream.on('error', (error) => {
      reject(new Error(`Stream error: ${error.message}`));
    });

    uploadStream.on('error', (error) => {
      reject(new Error(`Upload stream error: ${error.message}`));
    });
  });
};

// Upload from base64 string (alternative method)
export const uploadPassportFromBase64 = async (
  base64String: string,
  folder: string = 'badekshop/kyc'
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: 'image',
      folder,
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    throw new Error(
      `Base64 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Generate signed URL for passport access (expires in 10 minutes)
export const getSignedPassportUrl = (publicId: string, expiresIn: number = 600) => {
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
  
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: 'authenticated',
    expiration: timestamp,
  });
};

// Delete passport image
export const deletePassport = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(
      `Passport deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Verify Cloudinary configuration
export const verifyCloudinaryConfig = () => {
  const config = cloudinary.config();
  return {
    isConfigured: !!(config.cloud_name && config.api_key && config.api_secret),
    cloudName: config.cloud_name ? '✓ Set' : '✗ Missing',
    apiKey: config.api_key ? '✓ Set' : '✗ Missing',
    apiSecret: config.api_secret ? '✓ Set' : '✗ Missing',
  };
};

export default cloudinary;
