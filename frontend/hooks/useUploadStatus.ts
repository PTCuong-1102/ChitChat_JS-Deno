import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  UploadStatus, 
  UploadVerificationResult,
  UploadProgressTracker,
  verifyImageUpload,
  validateFileForUpload,
  formatFileSize
} from '../utils/uploadUtils.ts';

export interface UseUploadStatusOptions {
  autoVerify?: boolean;
  maxSizeMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  onStatusChange?: (status: UploadStatus) => void;
  onVerificationComplete?: (result: UploadVerificationResult) => void;
}

export interface UseUploadStatusReturn {
  // Status
  uploadStatus: UploadStatus;
  verificationResult: UploadVerificationResult | null;
  isUploading: boolean;
  isVerifying: boolean;
  
  // Actions
  startUpload: (file: File) => void;
  updateProgress: (progress: number) => void;
  completeUpload: (uploadedUrl: string) => Promise<void>;
  failUpload: (error: string) => void;
  resetStatus: () => void;
  verifyUpload: (imageUrl: string) => Promise<UploadVerificationResult>;
  validateFile: (file: File) => { valid: boolean; error?: string };
  
  // Utilities
  getFormattedFileSize: (file: File) => string;
  getStatusMessage: () => string;
  canRetry: () => boolean;
}

/**
 * React hook for managing upload status and verification
 */
export function useUploadStatus(options: UseUploadStatusOptions = {}): UseUploadStatusReturn {
  const {
    autoVerify = true,
    maxSizeMB = 5,
    allowedTypes = ['image/*'],
    allowedExtensions,
    onStatusChange,
    onVerificationComplete
  } = options;

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0
  });
  
  const [verificationResult, setVerificationResult] = useState<UploadVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const trackerRef = useRef<UploadProgressTracker | null>(null);

  // Initialize tracker
  useEffect(() => {
    const tracker = new UploadProgressTracker();
    
    const unsubscribe = tracker.onStatusChange((status) => {
      setUploadStatus(status);
      onStatusChange?.(status);
    });
    
    trackerRef.current = tracker;
    
    return () => {
      unsubscribe();
      trackerRef.current = null;
    };
  }, [onStatusChange]);

  /**
   * Validate a file before upload
   */
  const validateFile = useCallback((file: File) => {
    const result = validateFileForUpload(file, {
      maxSizeMB,
      allowedTypes,
      allowedExtensions
    });
    
    return {
      valid: result.valid,
      error: result.error
    };
  }, [maxSizeMB, allowedTypes, allowedExtensions]);

  /**
   * Start upload tracking
   */
  const startUpload = useCallback((file: File) => {
    console.log('🚀 Starting upload tracking for:', file.name);
    
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      trackerRef.current?.failure(validation.error || 'File validation failed');
      return;
    }
    
    // Reset previous verification result
    setVerificationResult(null);
    setIsVerifying(false);
    
    // Start tracking
    trackerRef.current?.start(file);
  }, [validateFile]);

  /**
   * Update upload progress
   */
  const updateProgress = useCallback((progress: number) => {
    trackerRef.current?.setProgress(progress);
  }, []);

  /**
   * Verify an uploaded image
   */
  const verifyUpload = useCallback(async (imageUrl: string): Promise<UploadVerificationResult> => {
    console.log('🔍 Starting upload verification...');
    setIsVerifying(true);
    
    try {
      const result = await verifyImageUpload(imageUrl);
      setVerificationResult(result);
      onVerificationComplete?.(result);
      
      console.log('✅ Upload verification completed:', result);
      return result;
    } catch (error) {
      const errorResult: UploadVerificationResult = {
        success: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
      
      setVerificationResult(errorResult);
      onVerificationComplete?.(errorResult);
      
      console.error('❌ Upload verification failed:', error);
      return errorResult;
    } finally {
      setIsVerifying(false);
    }
  }, [onVerificationComplete]);

  /**
   * Complete upload successfully
   */
  const completeUpload = useCallback(async (uploadedUrl: string) => {
    console.log('🎉 Upload completed:', uploadedUrl);
    
    // Mark upload as successful
    trackerRef.current?.success(uploadedUrl);
    
    // Auto-verify if enabled
    if (autoVerify) {
      await verifyUpload(uploadedUrl);
    }
  }, [autoVerify, verifyUpload]);

  /**
   * Mark upload as failed
   */
  const failUpload = useCallback((error: string) => {
    console.error('❌ Upload failed:', error);
    trackerRef.current?.failure(error);
    setVerificationResult(null);
    setIsVerifying(false);
  }, []);

  /**
   * Reset upload status
   */
  const resetStatus = useCallback(() => {
    console.log('🔄 Resetting upload status');
    trackerRef.current?.reset();
    setVerificationResult(null);
    setIsVerifying(false);
  }, []);

  /**
   * Get formatted file size
   */
  const getFormattedFileSize = useCallback((file: File) => {
    return formatFileSize(file.size);
  }, []);

  /**
   * Get current status message
   */
  const getStatusMessage = useCallback(() => {
    if (isVerifying) {
      return 'Verifying upload...';
    }
    
    if (uploadStatus.isUploading) {
      const progress = uploadStatus.progress || 0;
      return `Uploading... ${Math.round(progress)}%`;
    }
    
    if (uploadStatus.success) {
      if (verificationResult?.success) {
        return 'Upload successful and verified!';
      } else if (verificationResult && !verificationResult.success) {
        return `Upload completed but verification failed: ${verificationResult.error}`;
      } else if (autoVerify) {
        return 'Upload completed, verification pending...';
      } else {
        return 'Upload completed successfully!';
      }
    }
    
    if (uploadStatus.error) {
      return `Upload failed: ${uploadStatus.error}`;
    }
    
    return 'Ready to upload';
  }, [uploadStatus, verificationResult, isVerifying, autoVerify]);

  /**
   * Check if upload can be retried
   */
  const canRetry = useCallback(() => {
    return !uploadStatus.isUploading && !isVerifying && (
      uploadStatus.error || 
      (verificationResult && !verificationResult.success)
    );
  }, [uploadStatus, verificationResult, isVerifying]);

  return {
    // Status
    uploadStatus,
    verificationResult,
    isUploading: uploadStatus.isUploading,
    isVerifying,
    
    // Actions
    startUpload,
    updateProgress,
    completeUpload,
    failUpload,
    resetStatus,
    verifyUpload,
    validateFile,
    
    // Utilities
    getFormattedFileSize,
    getStatusMessage,
    canRetry
  };
}

/**
 * Hook for simple upload verification (without full tracking)
 */
export function useUploadVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<UploadVerificationResult | null>(null);

  const verify = useCallback(async (imageUrl: string) => {
    setIsVerifying(true);
    try {
      const verificationResult = await verifyImageUpload(imageUrl);
      setResult(verificationResult);
      return verificationResult;
    } catch (error) {
      const errorResult: UploadVerificationResult = {
        success: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsVerifying(false);
  }, []);

  return {
    verify,
    reset,
    isVerifying,
    result,
    isSuccess: result?.success === true,
    isAccessible: result?.accessible === true,
    error: result?.error
  };
}
