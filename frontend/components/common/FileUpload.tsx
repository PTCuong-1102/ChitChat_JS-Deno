import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => Promise<string>;
  currentImageUrl?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  uploadButtonText?: string;
  previewClassName?: string;
  onUploadStatusChange?: (status: UploadStatus) => void;
  enableVerification?: boolean;
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

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUpload,
  currentImageUrl,
  accept = "image/*",
  maxSize = 5,
  className = "",
  uploadButtonText = "Upload Image",
  previewClassName = "w-24 h-24 rounded-full object-cover",
  onUploadStatusChange,
  enableVerification = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSize}MB`;
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

    setError(null);
    setLastUploadResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Update initial status
    updateUploadStatus({
      isUploading: false,
      fileName: file.name,
      fileSize: file.size
    });

    onFileSelect(file);
  };

  const handleUpload = async (file: File) => {
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
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        updateUploadStatus(prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + 10, 90)
        }));
      }, 200);

      const imageUrl = await onUpload(file);
      
      clearInterval(progressInterval);
      
      // Update to 100% progress
      updateUploadStatus(prev => ({
        ...prev,
        progress: 100
      }));

      // Verify the uploaded image if enabled
      if (enableVerification) {
        console.log('🔍 Verifying uploaded image...');
        const verificationResult = await verifyImageUpload(imageUrl);
        setLastUploadResult(verificationResult);
        
        if (!verificationResult.success || !verificationResult.accessible) {
          throw new Error(verificationResult.error || 'Image upload verification failed');
        }
      }

      console.log('✅ Image upload successful');
      
      // Final success status
      updateUploadStatus({
        isUploading: false,
        success: true,
        fileName: file.name,
        fileSize: file.size,
        progress: 100,
        uploadedUrl: imageUrl
      });
      
      setPreviewUrl(null); // Clear preview after successful upload
      return imageUrl;
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
      
      throw error;
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
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center" 
             title="Last upload successful">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    if (lastUploadResult && !lastUploadResult.success) {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center" 
             title="Last upload failed">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Image Preview */}
      {(previewUrl || currentImageUrl) && (
        <div className="relative">
          <img 
            src={previewUrl || currentImageUrl} 
            alt="Preview" 
            className={previewClassName}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                {uploadStatus.progress !== undefined && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {Math.round(uploadStatus.progress)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {getStatusIndicator()}
        </div>
      )}

      {/* Upload Button */}
      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={isUploading}
        className="px-4 py-2 bg-brand-pink-500 text-white font-semibold rounded-lg hover:bg-brand-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title={isUploading ? `Uploading... ${uploadStatus.progress || 0}%` : uploadButtonText}
      >
        {isUploading ? `Uploading... ${Math.round(uploadStatus.progress || 0)}%` : uploadButtonText}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress Info */}
      {isUploading && uploadStatus.fileName && (
        <div className="text-sm text-gray-600 text-center">
          <div>Uploading: {uploadStatus.fileName}</div>
          {uploadStatus.fileSize && (
            <div className="text-xs opacity-75">
              Size: {(uploadStatus.fileSize / 1024 / 1024).toFixed(2)}MB
            </div>
          )}
          {uploadStatus.progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-brand-pink-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadStatus.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {lastUploadResult?.success && !isUploading && (
        <div className="flex items-center text-green-600 text-sm">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Upload successful and verified!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center text-red-500 text-sm">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
