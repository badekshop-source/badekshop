// src/app/(shop)/kyc/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function KycPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a passport photo to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // In a real implementation, we would send the file to our backend
      // For now, simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // On success, redirect to checkout
      // router.push('/checkout'); // Temporarily commented for build
      alert('Upload successful! Proceed to checkout.');
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Identity Verification</h1>
      <p className="text-gray-600 mb-8">Upload your passport photo for eSIM/SIM Card activation</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Passport Photo *
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Ensure text is clear, avoid glare, and do not crop the document.
            </p>

            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                preview ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
              }`}
              onClick={triggerFileInput}
            >
              {preview ? (
                <div>
                   <img 
                     src={preview} 
                     alt="Passport preview" 
                     className="mx-auto max-h-64 object-contain mb-4"
                     crossOrigin="anonymous"
                   />
                  <p className="text-green-600 font-medium">Photo uploaded successfully!</p>
                </div>
              ) : (
                <div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto text-gray-400 mb-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  <p className="text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="consent"
              required
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I consent to the processing of my personal data in accordance with the privacy policy
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              !file || isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Continue to Checkout'}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Why do we need this?</h3>
        <p className="text-sm text-blue-700">
          Identity verification is required for eSIM and SIM Card activation as mandated by Indonesian telecommunications regulations. 
          Your document will be securely stored and automatically deleted after 30 days.
        </p>
      </div>
    </div>
  );
}