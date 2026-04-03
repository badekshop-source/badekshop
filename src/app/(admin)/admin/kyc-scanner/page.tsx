// src/app/(admin)/admin/kyc-scanner/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KycScannerPage() {
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Could not access camera. Please ensure you have granted permission.');
        console.error('Camera error:', err);
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Simulate QR code scanning
  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    
    // In a real implementation, we would use a QR code scanning library
    // For now, we'll simulate the process with a timeout
    setTimeout(() => {
      // Simulate extracting order ID from QR code
      const mockOrderId = 'ord_' + Math.random().toString(36).substr(2, 9);
      setScannedData(mockOrderId);
      setIsLoading(false);
    }, 2000);
  };

  // Manual entry handler
  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const orderId = formData.get('orderId') as string;
    
    if (orderId) {
      setScannedData(orderId);
    }
  };

  // Process scanned order
  const processOrder = async () => {
    if (!scannedData) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, we would:
      // 1. Verify the order exists
      // 2. Check if order is approved
      // 3. Verify passport matches
      // 4. Process pickup
      
      // For now, simulate success
      setTimeout(() => {
        alert(`Order ${scannedData} processed successfully!`);
        setScannedData(null);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to process order. Please try again.');
      setIsLoading(false);
      console.error('Process order error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">QR Code Scanner</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Scan the QR code on customer's order confirmation to verify and process their SIM card pickup.
            </p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">
                <strong>Note:</strong> In a real implementation, this would use a QR scanning library like jsQR 
                to read QR codes from the camera feed. This is a simulation for demonstration purposes.
              </p>
            </div>
          </div>
          
          {/* Camera Feed (Simulated) */}
          <div className="mb-6">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-green-500 rounded-lg w-64 h-64 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-lg font-semibold mb-2">Camera View</div>
                    <div className="text-sm">Point at QR code to scan</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleScan}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Scanning...' : 'Scan QR Code'}
            </button>
          </div>
          
          {/* Manual Entry */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Manual Order Entry</h2>
            <form onSubmit={handleManualEntry} className="flex gap-2">
              <input
                type="text"
                name="orderId"
                placeholder="Enter order ID or number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 transition-colors"
              >
                Enter
              </button>
            </form>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {/* Scanned Result */}
          {scannedData && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Order Found</h3>
              <p className="text-green-700 mb-4">Order ID: {scannedData}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600">Name: John Doe</p>
                  <p className="text-sm text-gray-600">Email: john@example.com</p>
                  <p className="text-sm text-gray-600">Flight: GA123</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                  <p className="text-sm text-gray-600">Product: Bali eSIM 7 Days</p>
                  <p className="text-sm text-gray-600">Status: Approved</p>
                  <p className="text-sm text-gray-600">Pickup: Ngurah Rai Airport</p>
                </div>
              </div>
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={processOrder}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Confirm Pickup'}
                </button>
                
                <button
                  onClick={() => setScannedData(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Staff Instructions</h3>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>Verify customer's passport matches the one in the system</li>
              <li>Confirm customer has the QR code from their email</li>
              <li>Hand over the SIM card only after successful verification</li>
              <li>Record any issues in the admin system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}