"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";

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

export function ProductShowcaseSimple({ products }: ProductShowcaseProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          className="h-full"
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
