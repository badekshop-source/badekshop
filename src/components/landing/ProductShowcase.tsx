"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Smartphone, 
  CreditCard, 
  Wifi, 
  Clock, 
  Check,
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: "esim" | "sim";
  duration?: number;
  size?: string;
  price: number;
  originalPrice?: number;
  data?: string;
  description?: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface ProductShowcaseProps {
  products: Product[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<"esim" | "sim">("esim");

  // Filter products by category
  const filteredProducts = products.filter(
    (p) => p.category === activeCategory
  );

  return (
    <>
      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center mb-12"
      >
        <div className="inline-flex bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setActiveCategory("esim")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300",
              activeCategory === "esim"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Smartphone className="w-5 h-5" />
            eSIM
            <span className="hidden sm:inline text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Instant
            </span>
          </button>
          <button
            onClick={() => setActiveCategory("sim")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300",
              activeCategory === "sim"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <CreditCard className="w-5 h-5" />
            Physical SIM
            <span className="hidden sm:inline text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Airport Pickup
            </span>
          </button>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products available in this category.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className={cn(
                  "relative rounded-2xl p-6 transition-all duration-300 flex flex-col",
                  "min-h-[480px] max-h-[480px]", // Tetapkan tinggi tetap
                  product.popular
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/25 scale-105 z-10"
                    : "bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
                )}
              >
              {/* Badges */}
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              {product.bestValue && !product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Best Value
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4 flex-shrink-0",
                  product.popular
                    ? "bg-white/20"
                    : "bg-gradient-to-br from-blue-50 to-blue-100"
                )}
              >
                {product.category === "esim" ? (
                  <Wifi
                    className={cn(
                      "w-7 h-7",
                      product.popular ? "text-white" : "text-blue-600"
                    )}
                  />
                ) : (
                  <CreditCard
                    className={cn(
                      "w-7 h-7",
                      product.popular ? "text-white" : "text-blue-600"
                    )}
                  />
                )}
              </div>

              {/* Content Container */}
              <div className="flex-grow flex flex-col">
                {/* Name */}
                <h3
                  className={cn(
                    "text-xl font-bold mb-2 line-clamp-2",
                    product.popular ? "text-white" : "text-gray-900"
                  )}
                >
                  {product.name}
                </h3>
                
                {/* Duration */}
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  <Clock
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      product.popular ? "text-blue-200" : "text-gray-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm truncate",
                      product.popular ? "text-blue-100" : "text-gray-600"
                    )}
                  >
                    {product.duration ? `${product.duration} Days` : 'Varies'} • {product.data || 'Data'} 
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4 flex-shrink-0">
                  {product.originalPrice && (
                    <span
                      className={cn(
                        "text-sm line-through mr-2 block text-ellipsis overflow-hidden",
                        product.popular ? "text-blue-200" : "text-gray-400"
                      )}
                    >
                      Rp {product.originalPrice.toLocaleString("id-ID")}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-3xl font-bold",
                        product.popular ? "text-white" : "text-gray-900"
                      )}
                    >
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-grow overflow-hidden">
                  <ul className="space-y-2 max-h-20 overflow-hidden">
                    {(product.features || []).slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          className={cn(
                            "w-4 h-4 flex-shrink-0 mt-0.5",
                            product.popular ? "text-blue-200" : "text-green-500"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs",
                            product.popular ? "text-blue-50" : "text-gray-600"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                    {(product.features && product.features.length > 3) && (
                      <li className="text-xs text-gray-500 italic">
                        +{product.features.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href={`/checkout?product=${product.id}` as any}
                className={cn(
                  "block w-full py-3.5 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 mt-4 flex-shrink-0",
                  product.popular
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/25"
                )}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}
