// src/app/terms/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">Terms and conditions for using badekshop services</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Service Description</h2>
              <p className="text-gray-600">
                badekshop provides eSIM and physical SIM card services for tourists visiting Bali, Indonesia. All products require activation and pickup at our outlet located at Ngurah Rai International Airport, Bali.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>You must be a foreign tourist visiting Bali</li>
                <li>You must possess a valid passport</li>
                <li>You must provide a valid 15-digit IMEI number for your device</li>
                <li>You must complete identity verification (KYC) by uploading your passport photo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Ordering & Payment</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Orders are placed directly per product (no cart system)</li>
                <li>Payment is processed securely via Midtrans</li>
                <li>Payment must be completed within <strong>2 hours</strong> of order creation, or the order will expire</li>
                <li>All prices are in Indonesian Rupiah (IDR) and include applicable taxes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Identity Verification (KYC)</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Passport photo upload is mandatory for all orders</li>
                <li>Clear passport photos are approved automatically</li>
                <li>Maximum 3 upload attempts per order</li>
                <li>After 3 failed attempts, your document will be manually reviewed by our team</li>
                <li>IMEI number (15 digits) is required for SIM/eSIM activation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Pickup & Activation</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>SIM cards are picked up at our Ngurah Rai International Airport outlet</li>
                <li>You must present your QR code and original passport at the counter</li>
                <li>Our staff will verify your identity manually before handing over the SIM card</li>
                <li>Outlet operates 24/7</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Refund Policy</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Refunds are processed if your order expires without payment</li>
                <li>If your KYC is rejected, a refund will be processed minus a 5% administrative fee</li>
                <li>Refund amount = Total payment - Administrative fee (5%)</li>
                <li>Refund requests must be submitted within 7 days of order cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-600">
                badekshop is not liable for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Network coverage issues caused by third-party telecommunications providers</li>
                <li>Delays caused by customs or immigration authorities</li>
                <li>Device incompatibility with eSIM or SIM card technology</li>
                <li>Loss or damage to SIM cards after pickup</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Governing Law</h2>
              <p className="text-gray-600">
                These Terms of Service are governed by the laws of the Republic of Indonesia. Any disputes shall be resolved in the jurisdiction of Bali, Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
              <p className="text-gray-600">
                For questions about these Terms of Service, please contact us at:
              </p>
              <ul className="text-gray-600 space-y-1 mt-2">
                <li>Email: <a href="mailto:support@badekshop.com" className="text-blue-600 hover:underline">support@badekshop.com</a></li>
                <li>Phone: +62 819-3330-2000</li>
                <li>Address: Ngurah Rai International Airport, Bali, Indonesia</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
