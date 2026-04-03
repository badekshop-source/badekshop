// src/app/order-success/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyOrderToken } from '@/lib/token';

interface OrderSuccessPageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
  }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { id, token } = await searchParams;

  // If we have order ID and token, redirect to order detail page
  if (id && token) {
    // Verify the token
    const payload = verifyOrderToken(token);
    if (payload && payload.orderId === id) {
      // Redirect to order detail page which will show KYC form after payment
      redirect(`/order/${id}?token=${token}` as any);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Please complete your identity verification to activate your SIM card.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Next Step: Identity Verification</h3>
          <p className="text-sm text-blue-700">
            You will be redirected to upload your passport and IMEI number to complete your order.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={"/track-order" as any}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Track Orders
          </Link>
          <Link
            href={"/" as any}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}