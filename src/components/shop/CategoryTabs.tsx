"use client";

import { motion } from "framer-motion";
import { Smartphone, CreditCard, Zap, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type Category = "all" | "esim" | "sim";

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Info Label - All products require outlet pickup */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-full text-sm"
      >
        <MapPin className="w-4 h-4 text-blue-600" />
        <span className="text-blue-700 font-medium">
          All products require activation and pickup at our Ngurah Rai Airport outlet
        </span>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="inline-flex bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => onCategoryChange("all")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base",
              activeCategory === "all"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">ALL</span>
            <span className="sm:hidden">All</span>
          </button>
          <button
            onClick={() => onCategoryChange("esim")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base",
              activeCategory === "esim"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>eSIM</span>
          </button>
          <button
            onClick={() => onCategoryChange("sim")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base",
              activeCategory === "sim"
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">SIM CARD</span>
            <span className="sm:hidden">SIM</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
