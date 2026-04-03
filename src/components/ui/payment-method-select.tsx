'use client';

import Image from 'next/image';

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'visa', name: 'VISA', logo: '/images/payments/visa.svg' },
  { id: 'mastercard', name: 'Mastercard', logo: '/images/payments/mastercard.svg' },
  { id: 'jcb', name: 'JCB', logo: '/images/payments/jcb.svg' },
  { id: 'amex', name: 'American Express', logo: '/images/payments/amex.svg' },
  { id: 'unionpay', name: 'China UnionPay', logo: '/images/payments/unionpay.svg' },
];

interface PaymentMethodSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PaymentMethodSelect({ value, onChange, error }: PaymentMethodSelectProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Payment Method <span className="text-red-500">*</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover:border-blue-400 ${
              value === method.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Image
              src={method.logo}
              alt={method.name}
              width={48}
              height={48}
              className="mb-2"
            />
            <span className="text-sm font-medium text-gray-700">{method.name}</span>
            {value === method.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <p className="text-xs text-gray-500 text-center">
        Secured by Midtrans
      </p>
    </div>
  );
}
