"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TestimonialsList } from "./TestimonialsList";

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            Customer Love
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Travelers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied tourists who stayed connected with badekshop.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-2xl font-bold text-gray-900">4.9/5</p>
            <p className="text-sm text-gray-500">Average Rating</p>
          </div>
          <div className="w-px h-16 bg-gray-200 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">50K+</p>
            <p className="text-sm text-gray-500">Happy Customers</p>
          </div>
          <div className="w-px h-16 bg-gray-200 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">2,500+</p>
            <p className="text-sm text-gray-500">5-Star Reviews</p>
          </div>
        </motion.div>

        <TestimonialsList />
      </div>
    </section>
  );
}