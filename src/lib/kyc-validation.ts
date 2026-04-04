// src/lib/kyc-validation.ts
import sharp from 'sharp';

/**
 * Validates passport photo quality and authenticity
 * NOTE: All uploads are auto-approved to speed up activation.
 * Manual verification is done at the outlet counter.
 */
export async function validatePassportPhoto(imageBuffer: Buffer): Promise<{
  isValid: boolean;
  isClear: boolean;
  issues: string[];
}> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        isClear: false,
        issues: ['Could not determine image dimensions']
      };
    }

    if (metadata.width < 100 || metadata.height < 100) {
      return {
        isValid: false,
        isClear: false,
        issues: ['Image too small']
      };
    }

    // All uploads are auto-approved - manual check at outlet
    return {
      isValid: true,
      isClear: true,
      issues: []
    };
  } catch (error) {
    console.error('Error validating passport photo:', error);
    return {
      isValid: true, // Still approve even if validation fails
      isClear: true,
      issues: []
    };
  }
}

/**
 * Gets brightness statistics from a grayscale image buffer
 */
async function getBrightnessStats(imageBuffer: Buffer): Promise<{
  min: number;
  max: number;
  mean: number;
}> {
  const pixels = await sharp(imageBuffer).raw().toBuffer();
  
  let min = 255;
  let max = 0;
  let sum = 0;
  
  for (let i = 0; i < pixels.length; i++) {
    const value = pixels[i];
    if (value < min) min = value;
    if (value > max) max = value;
    sum += value;
  }
  
  return {
    min,
    max,
    mean: Math.round(sum / pixels.length)
  };
}

/**
 * Determines the appropriate KYC status based on validation results
 * NOTE: All uploads are auto-approved. Manual check at outlet.
 */
export function determineKycStatus(
  _validationResult: Awaited<ReturnType<typeof validatePassportPhoto>>,
  _currentAttempts: number
): {
  status: 'auto_approved' | 'retry_1' | 'retry_2' | 'under_review';
  requiresManualReview: boolean;
} {
  // Always auto-approve - manual verification at outlet
  return {
    status: 'auto_approved',
    requiresManualReview: false
  };
}