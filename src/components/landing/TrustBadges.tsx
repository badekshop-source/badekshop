"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  CreditCard, 
  Award, 
  Globe,
  Lock,
  Clock,
  BadgeCheck,
  Headphones
} from "lucide-react";

const trustBadges = [
  {
    icon: Shield,
    title: "SSL Secure",
    description: "256-bit encryption protects your data",
  },
  {
    icon: CreditCard,
    title: "Midtrans",
    description: "PCI-DSS compliant payment gateway",
  },
  {
    icon: Award,
    title: "#1 in Bali",
    description: "Trusted by 50,000+ tourists",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "All major Bali networks supported",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "GDPR compliant data handling",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Always here when you need us",
  },
  {
    icon: BadgeCheck,
    title: "Verified Business",
    description: "Officially registered in Indonesia",
  },
  {
    icon: Headphones,
    title: "Local Support",
    description: "English-speaking assistance",
  },
];

const paymentMethods = [
  { name: "VISA", color: "bg-blue-600" },
  { name: "Mastercard", color: "bg-red-600" },
  { name: "JCB", color: "bg-green-600" },
  { name: "AMEX", color: "bg-cyan-600" },
  { name: "UnionPay", color: "bg-red-700" },
];

export function TrustBadges() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-12"
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-300">
                <badge.icon className="w-7 h-7 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {badge.title}
              </h4>
              <p className="text-xs text-gray-500 leading-tight">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center pt-8 border-t border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-4">
            Secure payments powered by Midtrans
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <div className={`w-6 h-4 ${method.color} rounded`} />
                <span className="text-xs font-semibold text-gray-700">
                  {method.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
