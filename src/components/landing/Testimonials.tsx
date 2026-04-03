"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    country: "Australia",
    rating: 5,
    text: "Absolutely seamless experience! The eSIM activated immediately when I landed in Bali. The pickup process at the airport was super quick - just showed my QR code and got my SIM in 2 minutes. Highly recommend!",
  },
  {
    id: "2",
    name: "Michael Chen",
    country: "Singapore",
    rating: 5,
    text: "Traveled with my family of 4 and got SIM cards for everyone. The KYC process was instant with clear passport photos. Connection was excellent throughout Ubud and Seminyak. Will use again!",
  },
  {
    id: "3",
    name: "Emma Williams",
    country: "United Kingdom",
    rating: 5,
    text: "As a solo traveler, staying connected is crucial. Badekshop made it so easy - ordered before my flight, picked up at the airport, and had data the moment I landed. The 30-day plan was perfect for my 3-week trip.",
  },
  {
    id: "4",
    name: "David Kim",
    country: "South Korea",
    rating: 5,
    text: "Needed reliable internet for business meetings in Bali. The 5G speed was impressive and I never had connectivity issues. The customer support was very responsive when I had questions about setup.",
  },
];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-100" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.country}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
