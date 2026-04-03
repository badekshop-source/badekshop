"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { AsyncProductShowcase } from "@/components/landing/AsyncProductShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget";
import { CategoryTabs, Category } from "@/components/shop/CategoryTabs";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  return (
    <main className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      
      {/* Products Section */}
      <section className="py-20 bg-white" id="products">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Simple Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Stay connected throughout your Bali adventure with our flexible eSIM and physical SIM options.
            </p>
          </motion.div>

          {/* Category Tabs - Standalone Component */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            className="mb-12"
          />

          {/* Product Grid - Focused on data fetching and rendering */}
          <AsyncProductShowcase activeCategory={activeCategory} />
        </div>
      </section>
      
      <HowItWorks />
      <TrustBadges />
      <Testimonials />
      <FAQSection />
      <CTASection />
      <LandingFooter />
      <WhatsAppWidget />
    </main>
  );
}
