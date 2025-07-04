import React, { useRef, useState } from 'react';
import { apiService } from '../../services/apiService.ts';

interface ChatImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  className?: string;
  onUploadStatusChange?: (status: UploadStatus) => void;
}

export interface UploadStatus {
  isUploading: boolean;
  progress?: number;
  success?: boolean;
  error?: string;
  fileName?: string;
  fileSize?: number;
  uploadedUrl?: string;
}

export interface UploadVerificationResult {
  success: boolean;
  accessible: boolean;
  error?: string;
  verifiedUrl?: string;
}

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  </svg>
);

const ChatImageUpload: React.FC<ChatImageUploadProps> = ({ onImageUpload, className = "", onUploadStatusChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ isUploading: false });
  const [lastUploadResult, setLastUploadResult] = useState<UploadVerificationResult | null>(null);

  // Function to verify if uploaded image is accessible
  const verifyImageUpload = async (imageUrl: string): Promise<UploadVerificationResult> => {
    try {
      console.log('🔍 Verifying image upload:', imageUrl);
      
      // Try to fetch the image to verify it's accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log('✅ Image upload verified successfully');
        return {
          success: true,
          accessible: true,
          verifiedUrl: imageUrl
        };
      } else {
        console.warn('⚠️ Image not accessible:', response.status, response.statusText);
        return {
          success: false,
          accessible: false,
          error: `Image not accessible (${response.status})`
        };
      }
    } catch (error) {
      console.error('❌ Image verification failed:', error);
      return {
        success: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  };

  // Function to update upload status and notify parent
  const updateUploadStatus = (status: UploadStatus) => {
    setUploadStatus(status);
    onUploadStatusChange?.(status);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 5MB';
      setError(errorMsg);
      updateUploadStatus({
        isUploading: false,
        success: false,
        error: errorMsg,
        fileName: file.name,
        fileSize: file.size
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      setError(errorMsg);
      updateUploadStatus({
        isUploading: false,
        success: false,
        error: errorMsg,
        fileName: file.name,
        fileSize: file.size
      });
      return;
    }

    setIsUploading(true);
    setError(null);
    setLastUploadResult(null);
    
    // Start upload status
    updateUploadStatus({
      isUploading: true,
      fileName: file.name,
      fileSize: file.size,
      progress: 0
    });

    try {
      console.log('📤 Starting image upload...');
      
      // Simulate progress updates (since fetch doesn't provide real progress)
      const progressInterval = setInterval(() => {
        updateUploadStatus(prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + 10, 90)
        }));
      }, 200);

      const response = await apiService.uploadChatImage(file);
      
      clearInterval(progressInterval);
      
      console.log('📤 Upload response received:', response);
      
      // Update to 100% progress
      updateUploadStatus(prev => ({
        ...prev,
        progress: 100
      }));

      // Verify the uploaded image
      console.log('🔍 Verifying uploaded image...');
      const verificationResult = await verifyImageUpload(response.imageUrl);
      setLastUploadResult(verificationResult);
      
      if (verificationResult.success && verificationResult.accessible) {
        console.log('✅ Image upload and verification successful');
        
        // Final success status
        updateUploadStatus({
          isUploading: false,
          success: true,
          fileName: file.name,
          fileSize: file.size,
          progress: 100,
          uploadedUrl: response.imageUrl
        });
        
        onImageUpload(response.imageUrl);
        
        // Clear the input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(verificationResult.error || 'Image upload verification failed');
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMsg);
      
      updateUploadStatus({
        isUploading: false,
        success: false,
        error: errorMsg,
        fileName: file.name,
        fileSize: file.size
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (lastUploadResult?.success) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" 
             title="Last upload successful" />
      );
    }
    if (lastUploadResult && !lastUploadResult.success) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" 
             title="Last upload failed" />
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-brand-pink-500 hover:bg-brand-pink-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={isUploading ? `Uploading... ${uploadStatus.progress || 0}%` : "Upload image"}
        >
          {isUploading ? (
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-pink-500"></div>
              {uploadStatus.progress !== undefined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-pink-600">
                    {Math.round(uploadStatus.progress)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <ImageIcon />
          )}
        </button>
        
        {getStatusIndicator()}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress Tooltip */}
      {isUploading && uploadStatus.fileName && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded text-xs max-w-xs z-10">
          <div className="font-medium">Uploading: {uploadStatus.fileName}</div>
          <div className="text-xs opacity-75">
            {uploadStatus.fileSize && `Size: ${(uploadStatus.fileSize / 1024 / 1024).toFixed(2)}MB`}
          </div>
          {uploadStatus.progress !== undefined && (
            <div className="mt-1">
              <div className="w-full bg-blue-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{Math.round(uploadStatus.progress)}% complete</div>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {lastUploadResult?.success && !isUploading && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-xs max-w-xs z-10">
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Image uploaded successfully!
          </div>
          <button 
            onClick={() => setLastUploadResult(null)}
            className="ml-2 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs max-w-xs z-10">
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatImageUpload;
