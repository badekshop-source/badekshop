// src/app/track-order/page.tsx
'use client';

import { useState } from 'react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock order status
    setOrderStatus('processing');
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Track Your Order</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleTrack}>
          <div className="mb-4">
            <label htmlFor="orderNumber" className="block text-gray-700 font-medium mb-2">
              Order Number
            </label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter your order number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !orderNumber}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading || !orderNumber
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>
      </div>

      {orderStatus && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">#ORD-123456</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{orderStatus}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">Mar 29, 2026</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">Rp 137,500</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Order Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-600">March 29, 2026 at 10:30 AM</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${orderStatus !== 'pending' ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center mr-3`}>
                  {orderStatus !== 'pending' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white">2</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${orderStatus === 'pending' ? 'text-gray-500' : 'text-gray-800'}`}>
                    Payment Confirmed
                  </p>
                  {orderStatus !== 'pending' && (
                    <p className="text-sm text-gray-600">March 29, 2026 at 10:45 AM</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${['processing', 'approved', 'completed'].includes(orderStatus) ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center mr-3`}>
                  {['processing', 'approved', 'completed'].includes(orderStatus) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white">3</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${!['processing', 'approved', 'completed'].includes(orderStatus) ? 'text-gray-500' : 'text-gray-800'}`}>
                    KYC Verification
                  </p>
                  {['processing', 'approved', 'completed'].includes(orderStatus) && (
                    <p className="text-sm text-gray-600">March 29, 2026 at 11:00 AM</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}