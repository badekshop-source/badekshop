"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight,
  Package,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { ProductShowcaseSimple } from "./ProductShowcaseSimple";
import { CategoryTabs, Category } from "@/components/shop/CategoryTabs";

interface Product {
  id: string;
  name: string;
  category: "esim" | "sim";
  duration?: number;
  size?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  discountStart?: string;
  discountEnd?: string;
  description?: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  data?: string;
}

// Fallback data as specified in Handover.md
const fallbackProducts: Product[] = [
  {
    id: "fallback-1",
    name: "Bali Explorer",
    category: "esim",
    duration: 7,
    price: 300000,
    originalPrice: 350000,
    description: "Speed: 4G/LTE/5G\nValid for 30 Days\nFree Activation at Our Counter",
    features: ["4G/5G Speed", "Hotspot Support", "30 Days Validity", "Free Airport Pickup"],
    popular: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: "Unlimited"
  },
  {
    id: "fallback-2",
    name: "Tourist Starter",
    category: "esim",
    duration: 3,
    price: 150000,
    features: ["4G/5G Speed", "Hotspot Support", "30 Days Validity"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: "Unlimited"
  },
  {
    id: "fallback-3",
    name: "Paradise Plus",
    category: "esim",
    duration: 14,
    price: 500000,
    description: "Premium plan with priority support",
    features: ["4G/5G Speed", "Hotspot Support", "30 Days Validity", "Priority Support"],
    bestValue: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: "Unlimited"
  },
  {
    id: "fallback-4",
    name: "SIM 7 Days",
    category: "sim",
    duration: 7,
    price: 250000,
    features: ["Physical Nano SIM", "4G/5G Speed", "30 Days Validity"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: "Unlimited"
  },
  {
    id: "fallback-5",
    name: "SIM 14 Days",
    category: "sim",
    duration: 14,
    price: 450000,
    originalPrice: 500000,
    features: ["Physical Nano SIM", "4G/5G Speed", "30 Days Validity", "Free SIM Tool"],
    popular: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: "Unlimited"
  },
  {
    id: "fallback-6",
    name: "SIM 30 Days",
    category: "sim",
    duration: 30,
    price: 750000,
    features: ["Physical Nano SIM", "4G/5G Speed", "30 Days Validity", "Priority Support"],
    bestValue: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: "Unlimited"
  }
];

interface AsyncProductShowcaseProps {
  activeCategory: Category;
}

export function AsyncProductShowcase({ activeCategory }: AsyncProductShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoryQueryValue = activeCategory === 'sim' ? 'sim_card' : activeCategory;
        const categoryParam = activeCategory === 'all' ? '' : `category=${categoryQueryValue}`;
        const queryString = categoryParam ? `?${categoryParam}&active=true` : '?active=true';
        const response = await fetch(`/api/products${queryString}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Unknown error occurred');
        }
        
        const fetchedProducts = data.products || [];
        
        if (fetchedProducts.length === 0) {
          setProducts(fallbackProducts);
        } else {
          // Map DB products to include originalPrice for active discounts
          const mappedProducts = fetchedProducts.map((p: Product) => {
            const hasActiveDiscount = p.discountPercentage &&
              p.discountPercentage > 0 &&
              (!p.discountStart || new Date(p.discountStart) <= new Date()) &&
              (!p.discountEnd || new Date(p.discountEnd) >= new Date());
            
            if (hasActiveDiscount) {
              return {
                ...p,
                originalPrice: p.price,
                price: Math.round(p.price * (1 - (p.discountPercentage ?? 0) / 100)),
              };
            }
            return p;
          });
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  // Filter products by category if not 'all'
  // Normalize categories: DB uses 'sim_card', fallback uses 'sim'
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => {
        const normalizedCategory = (p.category as string) === 'sim_card' ? 'sim' : p.category;
        return normalizedCategory === activeCategory;
      });

  if (loading) {
    return (
      <div className="w-full">
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[...Array(3)].map((_, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-6 bg-white border-2 border-gray-100 animate-pulse"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-2 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="w-full">
        {/* Empty State - No Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 px-4"
        >
          {/* Icon Container with Animation */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-lg">
              <Package className="w-12 h-12 text-blue-400" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Products Coming Soon!
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-lg">
            We&apos;re preparing amazing eSIM and SIM card packages for your Bali adventure. Check back soon!
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            <Link
              href={"/products" as any}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-2 mt-8 text-gray-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 px-4"
        >
          {/* Icon Container with Animation */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-lg">
              <Package className="w-12 h-12 text-blue-400" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Products Coming Soon!
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-lg">
            We&apos;re preparing amazing eSIM and SIM card packages for your Bali adventure. Check back soon!
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            <Link
              href={"/products" as any}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-2 mt-8 text-gray-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      ) : (
        <ProductShowcaseSimple products={filteredProducts} />
      )}
    </div>
  );
}
