// src/app/checkout/page-wrapper.tsx
'use client';

import { Suspense } from 'react';
import CheckoutPageContent from './checkout-content';

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}