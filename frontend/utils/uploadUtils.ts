/**
 * Utility functions for image upload verification and status checking
 */

export interface UploadStatus {
  isUploading: boolean;
  progress?: number;
  success?: boolean;
  error?: string;
  fileName?: string;
  fileSize?: number;
  uploadedUrl?: string;
  timestamp?: number;
}

export interface UploadVerificationResult {
  success: boolean;
  accessible: boolean;
  error?: string;
  verifiedUrl?: string;
  responseStatus?: number;
  contentType?: string;
  contentLength?: number;
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

/**
 * Verify if an uploaded image is accessible and properly served
 */
export async function verifyImageUpload(imageUrl: string): Promise<UploadVerificationResult> {
  try {
    console.log('🔍 Verifying image upload:', imageUrl);
    
    // Try to fetch the image to verify it's accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    const result: UploadVerificationResult = {
      success: response.ok,
      accessible: response.ok,
      verifiedUrl: imageUrl,
      responseStatus: response.status,
      contentType: response.headers.get('content-type') || undefined,
      contentLength: parseInt(response.headers.get('content-length') || '0') || undefined
    };
    
    if (response.ok) {
      console.log('✅ Image upload verified successfully:', {
        url: imageUrl,
        status: response.status,
        contentType: result.contentType,
        contentLength: result.contentLength
      });
    } else {
      console.warn('⚠️ Image not accessible:', response.status, response.statusText);
      result.error = `Image not accessible (HTTP ${response.status})`;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Image verification failed:', error);
    return {
      success: false,
      accessible: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Validate a file before upload
 */
export function validateFileForUpload(
  file: File, 
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): UploadValidationResult {
  const { maxSizeMB = 5, allowedTypes = ['image/*'], allowedExtensions } = options;
  
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
  
  console.log('📋 Validating file for upload:', fileInfo);
  
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
      fileInfo
    };
  }
  
  // Check file type
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
  
  if (!isTypeAllowed) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      fileInfo
    };
  }
  
  // Check file extension if specified
  if (allowedExtensions && allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isExtensionAllowed = allowedExtensions.some(ext => 
      fileExtension === ext.toLowerCase().replace('.', '')
    );
    
    if (!isExtensionAllowed) {
      return {
        valid: false,
        error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
        fileInfo
      };
    }
  }
  
  console.log('✅ File validation passed');
  return {
    valid: true,
    fileInfo
  };
}

/**
 * Check if an upload was successful by verifying the uploaded image
 */
export async function checkUploadSuccess(uploadedUrl: string): Promise<boolean> {
  try {
    const verificationResult = await verifyImageUpload(uploadedUrl);
    return verificationResult.success && verificationResult.accessible;
  } catch (error) {
    console.error('❌ Upload success check failed:', error);
    return false;
  }
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a progress tracker for uploads
 */
export class UploadProgressTracker {
  private status: UploadStatus;
  private listeners: ((status: UploadStatus) => void)[] = [];
  
  constructor(initialFile?: File) {
    this.status = {
      isUploading: false,
      progress: 0,
      timestamp: Date.now(),
      ...(initialFile && {
        fileName: initialFile.name,
        fileSize: initialFile.size
      })
    };
  }
  
  /**
   * Add a listener for status changes
   */
  onStatusChange(listener: (status: UploadStatus) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Update upload status
   */
  updateStatus(updates: Partial<UploadStatus>): void {
    this.status = {
      ...this.status,
      ...updates,
      timestamp: Date.now()
    };
    
    console.log('📊 Upload status updated:', this.status);
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(this.status));
  }
  
  /**
   * Start upload tracking
   */
  start(file?: File): void {
    this.updateStatus({
      isUploading: true,
      progress: 0,
      success: undefined,
      error: undefined,
      ...(file && {
        fileName: file.name,
        fileSize: file.size
      })
    });
  }
  
  /**
   * Update progress
   */
  setProgress(progress: number): void {
    this.updateStatus({ progress: Math.min(Math.max(progress, 0), 100) });
  }
  
  /**
   * Mark upload as successful
   */
  success(uploadedUrl: string): void {
    this.updateStatus({
      isUploading: false,
      progress: 100,
      success: true,
      uploadedUrl,
      error: undefined
    });
  }
  
  /**
   * Mark upload as failed
   */
  failure(error: string): void {
    this.updateStatus({
      isUploading: false,
      success: false,
      error
    });
  }
  
  /**
   * Get current status
   */
  getStatus(): UploadStatus {
    return { ...this.status };
  }
  
  /**
   * Reset tracker
   */
  reset(): void {
    this.status = {
      isUploading: false,
      progress: 0,
      timestamp: Date.now()
    };
    this.listeners.forEach(listener => listener(this.status));
  }
}

/**
 * Simulate upload progress for APIs that don't provide real progress
 */
export function simulateUploadProgress(
  onProgress: (progress: number) => void,
  duration: number = 2000
): () => void {
  let progress = 0;
  const interval = 100; // Update every 100ms
  const increment = (interval / duration) * 90; // Stop at 90% to wait for completion
  
  const timer = setInterval(() => {
    progress = Math.min(progress + increment, 90);
    onProgress(progress);
    
    if (progress >= 90) {
      clearInterval(timer);
    }
  }, interval);
  
  // Return cleanup function
  return () => clearInterval(timer);
}

/**
 * Batch verify multiple uploaded images
 */
export async function batchVerifyUploads(imageUrls: string[]): Promise<UploadVerificationResult[]> {
  console.log('🔍 Batch verifying uploads:', imageUrls);
  
  const verifications = await Promise.allSettled(
    imageUrls.map(url => verifyImageUpload(url))
  );
  
  return verifications.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`❌ Verification failed for ${imageUrls[index]}:`, result.reason);
      return {
        success: false,
        accessible: false,
        error: result.reason instanceof Error ? result.reason.message : 'Verification failed'
      };
    }
  });
}
