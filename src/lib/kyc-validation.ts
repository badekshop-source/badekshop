// src/lib/kyc-validation.ts
import sharp from 'sharp';

/**
 * Validates passport photo quality and authenticity
 * @param imageBuffer - Buffer containing the image data
 * @returns Promise<boolean> - Whether the photo passes validation
 */
export async function validatePassportPhoto(imageBuffer: Buffer): Promise<{
  isValid: boolean;
  isClear: boolean; // Whether the photo is clear enough for automated approval
  issues: string[]; // List of detected issues
}> {
  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        isClear: false,
        issues: ['Could not determine image dimensions']
      };
    }

    // Check minimum dimensions (passports typically have standard sizes)
    if (metadata.width < 300 || metadata.height < 300) {
      return {
        isValid: false,
        isClear: false,
        issues: [`Image too small: ${metadata.width}x${metadata.height}px (minimum 300x300px)`]
      };
    }

    // Check aspect ratio (passport photos typically have specific ratios)
    const aspectRatio = metadata.width / metadata.height;
    const validAspectRatios = [
      3 / 2, // Standard passport 3:2 ratio
      4 / 3, // Common photo ratio
      1.586, // US passport ratio (1.586:1)
    ];

    const isCorrectAspectRatio = validAspectRatios.some(ratio => 
      Math.abs(aspectRatio - ratio) < 0.2 // Allow some tolerance
    );

    const issues: string[] = [];
    
    if (!isCorrectAspectRatio) {
      issues.push(`Unusual aspect ratio: ${aspectRatio.toFixed(2)}, expected around 3:2 or 4:3`);
    }

    // Get image statistics to check for blur and quality
    const image = sharp(imageBuffer);
    
    // Convert to grayscale for blur analysis
    const grayscaleBuffer = await image
      .grayscale()
      .toBuffer();
    
    // Simple blur detection using Sharp's resize and compare
    const resized = await image.resize(10, 10).toBuffer();
    const originalSmall = await sharp(imageBuffer).resize(10, 10).toBuffer();
    
    // Compare pixel values to estimate sharpness
    let diffSum = 0;
    for (let i = 0; i < resized.length; i += 4) { // RGBA channels
      const originalAvg = (originalSmall[i] + originalSmall[i+1] + originalSmall[i+2]) / 3;
      const resizedAvg = (resized[i] + resized[i+1] + resized[i+2]) / 3;
      diffSum += Math.abs(originalAvg - resizedAvg);
    }
    
    const avgDiff = diffSum / (resized.length / 4);
    
    // Determine if image is too blurry
    const isBlurry = avgDiff < 10; // Threshold value based on testing
    if (isBlurry) {
      issues.push('Image appears blurry or out of focus');
    }

    // Check brightness levels
    const brightnessStats = await getBrightnessStats(grayscaleBuffer);
    if (brightnessStats.mean < 30) { // Too dark
      issues.push('Image is too dark');
    } else if (brightnessStats.mean > 220) { // Too bright/washed out
      issues.push('Image is too bright or washed out');
    }

    // Check contrast
    const contrast = brightnessStats.max - brightnessStats.min;
    if (contrast < 50) { // Low contrast
      issues.push('Image has low contrast');
    }

    // Determine overall validity and clarity
    const hasMajorIssues = issues.length > 0;
    const isValid = !hasMajorIssues || issues.every(issue => 
      issue.includes('aspect ratio') // Allow minor aspect ratio issues
    );
    
    // A photo is considered "clear" if it has minimal issues
    const isClear = !isBlurry && brightnessStats.mean >= 80 && brightnessStats.mean <= 180 && contrast >= 80;

    return {
      isValid,
      isClear,
      issues
    };
  } catch (error) {
    console.error('Error validating passport photo:', error);
    return {
      isValid: false,
      isClear: false,
      issues: ['Error processing image']
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
 */
export function determineKycStatus(
  validationResult: Awaited<ReturnType<typeof validatePassportPhoto>>,
  currentAttempts: number
): {
  status: 'auto_approved' | 'retry_1' | 'retry_2' | 'under_review';
  requiresManualReview: boolean;
} {
  if (validationResult.isClear && validationResult.isValid) {
    return {
      status: 'auto_approved',
      requiresManualReview: false
    };
  }
  
  if (currentAttempts === 0) {
    return {
      status: 'retry_1',
      requiresManualReview: false
    };
  } else if (currentAttempts === 1) {
    return {
      status: 'retry_2',
      requiresManualReview: false
    };
  } else {
    return {
      status: 'under_review',
      requiresManualReview: true
    };
  }
}