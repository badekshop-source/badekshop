// src/app/checkout/page.tsx
import { Suspense } from 'react';
import CheckoutPageContent from './checkout-content';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-4xl">Loading checkout...</div>}>
          <CheckoutPageContent />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
