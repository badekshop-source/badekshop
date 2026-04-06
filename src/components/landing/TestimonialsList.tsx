"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  country: string;
  rating: number;
  reviewText: string;
  reviewedAt: string;
}

const fallbackTestimonials: Review[] = [
  {
    id: "fallback-1",
    userName: "Sarah Johnson",
    country: "Australia",
    rating: 5,
    reviewText: "Absolutely seamless experience! The eSIM activated immediately when I landed in Bali. The pickup process at the airport was super quick - just showed my QR code and got my SIM in 2 minutes. Highly recommend!",
    reviewedAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    userName: "Michael Chen",
    country: "Singapore",
    rating: 5,
    reviewText: "Traveled with my family of 4 and got SIM cards for everyone. The KYC process was instant with clear passport photos. Connection was excellent throughout Ubud and Seminyak. Will use again!",
    reviewedAt: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    userName: "Emma Williams",
    country: "United Kingdom",
    rating: 5,
    reviewText: "As a solo traveler, staying connected is crucial. Badekshop made it so easy - ordered before my flight, picked up at the airport, and had data the moment I landed. The 30-day plan was perfect for my 3-week trip.",
    reviewedAt: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    userName: "David Kim",
    country: "South Korea",
    rating: 5,
    reviewText: "Needed reliable internet for business meetings in Bali. The 5G speed was impressive and I never had connectivity issues. The customer support was very responsive when I had questions about setup.",
    reviewedAt: new Date().toISOString(),
  },
];

function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 animate-pulse">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-2 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/reviews?minRating=4&limit=6");
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          setReviews(data.data);
        } else {
          // Use fallback if no reviews
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const displayReviews = error || reviews.length === 0 ? fallbackTestimonials : reviews;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {displayReviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 relative"
        >
          <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-100" />
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            &ldquo;{review.reviewText}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {review.userName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{review.userName}</p>
              <p className="text-sm text-gray-500">{review.country}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}