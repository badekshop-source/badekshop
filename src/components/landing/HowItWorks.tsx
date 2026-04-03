"use client";

import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  CreditCard, 
  Upload, 
  QrCode,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    number: "01",
    title: "Choose Your Plan",
    description: "Browse our eSIM and SIM card options. Select the duration that fits your Bali stay - from 3 to 30 days.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: CreditCard,
    number: "02",
    title: "Secure Payment",
    description: "Complete checkout with Midtrans. We accept all major credit cards (VISA, Mastercard, JCB, AMEX, UnionPay).",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Upload,
    number: "03",
    title: "Upload Documents",
    description: "After payment, upload your passport photo and IMEI number. Our AI system approves clear documents instantly.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: QrCode,
    number: "04",
    title: "Get Your QR Code",
    description: "Once approved, receive your QR code via email. Show this at our Ngurah Rai Airport counter for SIM pickup.",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: CheckCircle,
    number: "05",
    title: "Stay Connected",
    description: "Enjoy unlimited 4G/5G data throughout Bali. Our support team is available 24/7 if you need any assistance.",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Get your Bali SIM in 5 simple steps. No complicated procedures, no hidden fees.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-cyan-200 -translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center ${
                  index !== 0 ? "lg:mt-12" : ""
                }`}
              >
                {/* Content - Alternating sides on desktop */}
                <div
                  className={`${
                    index % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:col-start-2 lg:pl-16"
                  }`}
                >
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 ${
                      index % 2 === 0 ? "lg:ml-auto" : ""
                    }`}
                  >
                    {/* Step Number Badge */}
                    <div
                      className={`inline-flex items-center gap-2 mb-4 ${
                        index % 2 === 0 ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      <span
                        className={`text-4xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                      >
                        {step.number}
                      </span>
                      <div
                        className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center`}
                      >
                        <step.icon
                          className={`w-6 h-6 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                          style={{
                            stroke: "url(#gradient)",
                          }}
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Dot (Desktop) */}
                <div
                  className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center ${
                    index % 2 === 0 ? "lg:col-start-1 lg:col-end-3" : ""
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Empty space for alternating layout */}
                <div className={index % 2 === 0 ? "lg:col-start-2" : "hidden"} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 mb-4">
            Questions about the process? We&apos;re here to help!
          </p>
          <a
            href="#faq"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Check our FAQ
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
