"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href={"/" as any} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className={cn("text-xl font-bold transition-colors", isScrolled ? "text-gray-900" : "text-white")}>
                badekshop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href={"/products" as any} className={cn("text-sm font-medium transition-colors hover:text-blue-200", isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90")}>
                Products
              </Link>
              <a href="#how-it-works" className={cn("text-sm font-medium transition-colors hover:text-blue-200", isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90")}>
                How It Works
              </a>
              <a href="#faq" className={cn("text-sm font-medium transition-colors hover:text-blue-200", isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90")}>
                FAQ
              </a>
              <Link href={"/track-order" as any} className={cn("text-sm font-medium transition-colors hover:text-blue-200", isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90")}>
                Track Order
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href={"/products" as any}
                className={cn(
                  "px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300",
                  isScrolled
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/25"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                )}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn("md:hidden p-2 rounded-lg transition-colors", isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10")}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-white shadow-xl border-t border-gray-100">
              <nav className="flex flex-col p-4">
                <Link href={"/products" as any} onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Products
                </Link>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  How It Works
                </a>
                <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  FAQ
                </a>
                <Link href={"/track-order" as any} onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                  Track Order
                </Link>
                <Link href={"/products" as any} onClick={() => setIsMobileMenuOpen(false)} className="mt-4 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-full font-semibold">
                  Get Started
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
