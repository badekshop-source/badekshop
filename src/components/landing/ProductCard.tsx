"use client";

import Link from "next/link";
import { 
  Smartphone, 
  CreditCard, 
  Wifi, 
  Clock, 
  Check,
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div 
      className={cn(
        "relative rounded-2xl p-6 transition-all duration-300 flex flex-col",
        "border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50",
        "bg-white h-full",
        product.popular && "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/25 scale-105 z-10"
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
          "w-14 h-14 rounded-xl flex items-center justify-center mb-3 flex-shrink-0",
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

      {/* Category Badge */}
      <div className="mb-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
            product.category === "esim"
              ? product.popular
                ? "bg-green-400/30 text-green-50"
                : "bg-green-100 text-green-700"
              : product.popular
                ? "bg-orange-400/30 text-orange-50"
                : "bg-orange-100 text-orange-700"
          )}
        >
          {product.category === "esim" ? (
            <>
              <Smartphone className="w-3 h-3" />
              eSIM
            </>
          ) : (
            <>
              <CreditCard className="w-3 h-3" />
              Physical SIM
            </>
          )}
        </span>
      </div>

      {/* Content Container */}
      <div className="flex-grow flex flex-col">
        {/* Name */}
        <div className="mb-2">
          <h3
            className={cn(
              "text-xl font-bold line-clamp-2",
              product.popular ? "text-white" : "text-gray-900"
            )}
          >
            {product.name}
          </h3>
        </div>
        
        {/* Duration */}
        <div className="flex items-center gap-2 mb-3">
          <Clock
            className={cn(
              "w-4 h-4 flex-shrink-0",
              product.popular ? "text-blue-200" : "text-gray-500"
            )}
          />
          <span
            className={cn(
              "text-sm",
              product.popular ? "text-blue-100" : "text-gray-600"
            )}
          >
            {product.duration ? `${product.duration} Days` : 'Varies'} • {product.data || 'Data'} 
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          {product.originalPrice && (
            <span
              className={cn(
                "text-sm line-through mr-2 block",
                product.popular ? "text-blue-200" : "text-gray-400"
              )}
            >
              Rp {product.originalPrice.toLocaleString("id-ID")}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-2xl font-bold",
                product.popular ? "text-white" : "text-gray-900"
              )}
            >
              Rp {product.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="flex-grow mb-4">
          <ul className="space-y-2">
            {(product.features && product.features.length > 0) ? (
              <>
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
                        "text-sm leading-tight",
                        product.popular ? "text-blue-50" : "text-gray-600"
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
                {(product.features && product.features.length > 3) && (
                  <li className="text-xs text-gray-500 italic pt-1">
                    +{product.features.length - 3} more
                  </li>
                )}
              </>
            ) : (
              <li className="text-sm text-gray-400 italic">
                No features listed
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href={`/checkout?product=${product.id}` as any}
        className={cn(
          "block w-full py-3.5 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 mt-auto flex-shrink-0",
          product.popular
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/25"
        )}
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}