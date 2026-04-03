"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is the difference between eSIM and Physical SIM?",
    answer: "eSIM is a digital SIM that activates instantly on your phone without needing a physical card. It's perfect if your phone supports eSIM technology. Physical SIM is a traditional nano-SIM card that you pick up at our Ngurah Rai Airport counter. Both offer the same data plans and coverage.",
  },
  {
    question: "Where can I pick up my SIM card?",
    answer: "Physical SIM cards can be picked up at our counter in Ngurah Rai International Airport (DPS). We are located in the Arrival Hall. For eSIM, you will receive a QR code via email immediately after KYC approval - no pickup needed!",
  },
  {
    question: "How long does the KYC verification take?",
    answer: "Clear passport photos are approved instantly by our AI system (under 30 seconds). If the photo is unclear, you will have up to 3 retry attempts. After 3 failed attempts, our team manually reviews within 2 hours during business hours.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards through Midtrans secure payment gateway: VISA, Mastercard, JCB, American Express (AMEX), and UnionPay. All transactions are PCI-DSS compliant and encrypted.",
  },
  {
    question: "Can I get a refund if my plans change?",
    answer: "Yes, we offer refunds based on our refund policy. Orders can be refunded before KYC approval with a small admin fee (5%). Once KYC is approved and QR code is generated, refunds are handled case by case. Please contact our support team for assistance.",
  },
  {
    question: "How do I activate my eSIM?",
    answer: "After KYC approval, you will receive an email with a QR code. On your iPhone: Settings > Cellular > Add Cellular Plan > Scan QR code. On Android: Settings > Connections > SIM card manager > Add mobile plan > Scan QR code. Your eSIM will activate within minutes.",
  },
  {
    question: "Is the data truly unlimited?",
    answer: "Yes! All our plans offer truly unlimited 4G/LTE/5G data within Bali. There are no speed throttling or data caps. You can use your data for navigation, social media, video calls, streaming - whatever you need during your trip.",
  },
  {
    question: "What if I need help during my trip?",
    answer: "Our customer support is available 24/7 via WhatsApp and email. You can reach us at +62 819-3330-2000 or through the chat widget on our website. We also have staff at the airport counter during operating hours.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white" id="faq">
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
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Everything you need to know about our SIM cards and eSIM service.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12 p-8 bg-blue-50 rounded-2xl max-w-2xl mx-auto"
        >
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <a
            href="https://wa.me/6281933302000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
