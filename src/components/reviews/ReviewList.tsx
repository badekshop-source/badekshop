// src/components/reviews/ReviewList.tsx
"use client";

import { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { Review } from "@/types";
import { Loader2 } from "lucide-react";

interface ReviewListProps {
  limit?: number;
}

export function ReviewList({ limit = 6 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?limit=${limit}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch reviews");
        }

        setReviews(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load reviews at this time.</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          userName={review.userName}
          country={review.country}
          rating={review.rating}
          tripType={review.tripType}
          tripDuration={review.tripDuration}
          reviewText={review.reviewText}
          reviewedAt={review.reviewedAt}
        />
      ))}
    </div>
  );
}