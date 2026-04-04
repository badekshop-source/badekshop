// src/app/privacy-policy/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">How we collect, use, and protect your personal data</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-600 mb-3">We collect the following information to provide our services:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Full name (as shown in passport)</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Nationality</li>
                <li>Arrival date and flight number</li>
                <li>IMEI number (15 digits)</li>
                <li>Passport photo (for identity verification)</li>
                <li>Payment information (processed securely via Midtrans)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Process and fulfill your SIM card/eSIM order</li>
                <li>Verify your identity as required by Indonesian telecommunications regulations</li>
                <li>Send order confirmations, KYC status updates, and QR codes via email</li>
                <li>Provide customer support</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Retention</h2>
              <p className="text-gray-600">
                Your passport photo and personal data are automatically deleted from our systems <strong>30 days</strong> after your order is completed. Order records (without passport images) are retained for accounting and legal purposes for up to 5 years.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
              <p className="text-gray-600">We do not sell or share your personal data with third parties except:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><strong>Midtrans</strong> - for payment processing</li>
                <li><strong>Cloudinary</strong> - for secure passport photo storage (auto-deleted after 30 days)</li>
                <li><strong>Resend</strong> - for sending transactional emails</li>
                <li>When required by Indonesian law or government authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
              <p className="text-gray-600">
                We implement industry-standard security measures to protect your data, including encrypted connections (HTTPS), secure database storage, and access controls. Your passport photos are stored with signed URLs that expire after 10 minutes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-600">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Request access to your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal retention requirements)</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us at:
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
