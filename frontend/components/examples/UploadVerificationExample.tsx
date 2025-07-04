import React, { useState } from 'react';
import { useUploadStatus, useUploadVerification } from '../../hooks/useUploadStatus.ts';
import { apiService } from '../../services/apiService.ts';
import { checkUploadSuccess, batchVerifyUploads } from '../../utils/uploadUtils.ts';

/**
 * Example component demonstrating how to use the upload verification functionality
 */
const UploadVerificationExample: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  
  // Using the full upload status hook
  const uploadHook = useUploadStatus({
    autoVerify: true,
    maxSizeMB: 5,
    allowedTypes: ['image/*'],
    onStatusChange: (status) => {
      console.log('📊 Upload status changed:', status);
    },
    onVerificationComplete: (result) => {
      console.log('🔍 Verification completed:', result);
    }
  });

  // Using the simple verification hook
  const verificationHook = useUploadVerification();

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Validate the file
      const validation = uploadHook.validateFile(file);
      if (!validation.valid) {
        alert(`File validation failed: ${validation.error}`);
        return;
      }
      
      console.log('✅ File selected and validated:', file.name);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Start upload tracking
      uploadHook.startUpload(selectedFile);

      // Simulate progress updates (in real scenario, this would come from the API)
      const progressInterval = setInterval(() => {
        uploadHook.updateProgress(Math.min((uploadHook.uploadStatus.progress || 0) + 10, 90));
      }, 200);

      // Upload the file
      const response = await apiService.uploadChatImage(selectedFile);
      
      clearInterval(progressInterval);

      // Complete the upload (this will automatically verify if autoVerify is true)
      await uploadHook.completeUpload(response.imageUrl);

      // Add to uploaded URLs list
      setUploadedUrls(prev => [...prev, response.imageUrl]);
      
      console.log('🎉 Upload completed successfully!');
    } catch (error) {
      uploadHook.failUpload(error instanceof Error ? error.message : 'Upload failed');
      console.error('❌ Upload failed:', error);
    }
  };

  // Handle manual verification of a URL
  const handleManualVerification = async (url: string) => {
    const result = await verificationHook.verify(url);
    
    if (result.success) {
      alert('✅ Image is accessible and properly uploaded!');
    } else {
      alert(`❌ Verification failed: ${result.error}`);
    }
  };

  // Handle batch verification
  const handleBatchVerification = async () => {
    if (uploadedUrls.length === 0) {
      alert('No uploaded images to verify');
      return;
    }

    console.log('🔍 Starting batch verification...');
    const results = await batchVerifyUploads(uploadedUrls);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    alert(`Batch verification completed:\n✅ ${successCount} successful\n❌ ${failureCount} failed`);
    
    console.log('📊 Batch verification results:', results);
  };

  // Handle simple upload success check
  const handleQuickCheck = async (url: string) => {
    const isSuccess = await checkUploadSuccess(url);
    alert(isSuccess ? '✅ Upload is accessible!' : '❌ Upload check failed!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Verification Example</h2>
      
      {/* File Selection */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">1. Select File</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="mb-2"
        />
        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({uploadHook.getFormattedFileSize(selectedFile)})
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">2. Upload & Track Status</h3>
        
        <div className="mb-4">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadHook.isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 mr-2"
          >
            {uploadHook.isUploading ? 'Uploading...' : 'Upload File'}
          </button>
          
          <button
            onClick={uploadHook.resetStatus}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Reset Status
          </button>
        </div>

        {/* Status Display */}
        <div className="p-3 bg-gray-100 rounded">
          <div className="font-medium">Status: {uploadHook.getStatusMessage()}</div>
          
          {uploadHook.uploadStatus.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadHook.uploadStatus.progress}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{Math.round(uploadHook.uploadStatus.progress)}% complete</div>
            </div>
          )}

          {uploadHook.verificationResult && (
            <div className={`mt-2 p-2 rounded text-sm ${
              uploadHook.verificationResult.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className="font-medium">
                Verification: {uploadHook.verificationResult.success ? 'PASSED' : 'FAILED'}
              </div>
              {uploadHook.verificationResult.error && (
                <div>Error: {uploadHook.verificationResult.error}</div>
              )}
              {uploadHook.verificationResult.contentType && (
                <div>Content Type: {uploadHook.verificationResult.contentType}</div>
              )}
            </div>
          )}

          {uploadHook.canRetry() && (
            <button
              onClick={handleUpload}
              className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-sm"
            >
              Retry Upload
            </button>
          )}
        </div>
      </div>

      {/* Uploaded Images */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">3. Uploaded Images</h3>
        
        {uploadedUrls.length === 0 ? (
          <div className="text-gray-500">No images uploaded yet</div>
        ) : (
          <>
            <div className="mb-4">
              <button
                onClick={handleBatchVerification}
                className="px-4 py-2 bg-purple-500 text-white rounded"
              >
                Verify All ({uploadedUrls.length})
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedUrls.map((url, index) => (
                <div key={index} className="border rounded p-3">
                  <img 
                    src={url} 
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="text-xs text-gray-600 mb-2 break-all">{url}</div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleManualVerification(url)}
                      disabled={verificationHook.isVerifying}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      {verificationHook.isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleQuickCheck(url)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Quick Check
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Manual Verification Section */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">4. Manual Verification</h3>
        
        {verificationHook.result && (
          <div className={`mb-3 p-3 rounded ${
            verificationHook.isSuccess 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className="font-medium">
              Last Verification: {verificationHook.isSuccess ? 'SUCCESS' : 'FAILED'}
            </div>
            {verificationHook.error && <div>Error: {verificationHook.error}</div>}
            {verificationHook.result.responseStatus && (
              <div>HTTP Status: {verificationHook.result.responseStatus}</div>
            )}
            {verificationHook.result.contentType && (
              <div>Content Type: {verificationHook.result.contentType}</div>
            )}
          </div>
        )}
        
        <button
          onClick={verificationHook.reset}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear Verification Result
        </button>
      </div>

      {/* API Reference */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">API Reference</h3>
        <div className="text-sm space-y-2">
          <div><strong>useUploadStatus:</strong> Complete upload tracking with auto-verification</div>
          <div><strong>useUploadVerification:</strong> Simple verification hook for existing URLs</div>
          <div><strong>verifyImageUpload:</strong> Utility function to verify a single URL</div>
          <div><strong>checkUploadSuccess:</strong> Quick boolean check for upload success</div>
          <div><strong>batchVerifyUploads:</strong> Verify multiple URLs at once</div>
          <div><strong>validateFileForUpload:</strong> Pre-upload file validation</div>
        </div>
      </div>
    </div>
  );
};

export default UploadVerificationExample;
