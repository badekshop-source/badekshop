// src/components/reviews/ReviewForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, Loader2 } from "lucide-react";

interface ReviewFormProps {
  orderId: string;
  token: string;
  customerEmail: string;
}

const tripTypes = [
  { value: "leisure", label: "Leisure" },
  { value: "business", label: "Business Trip" },
  { value: "family", label: "Family Trip" },
  { value: "solo", label: "Solo Travel" },
];

const tripDurations = [
  { value: "1-3", label: "1-3 days" },
  { value: "4-7", label: "4-7 days" },
  { value: "8-14", label: "8-14 days" },
  { value: "15+", label: "15+ days" },
];

export function ReviewForm({ orderId, token, customerEmail }: ReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: customerEmail,
    country: "",
    rating: 0,
    tripType: "",
    tripDuration: "",
    reviewText: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          orderId,
          token,
          rating: Number(formData.rating),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/order/${orderId}?token=${token}` as any);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-600 fill-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-4">
          Your review has been submitted successfully.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you back to your order...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How would you rate your experience? *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= formData.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {formData.rating > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {formData.rating === 1 && "Very Dissatisfied"}
            {formData.rating === 2 && "Dissatisfied"}
            {formData.rating === 3 && "Neutral"}
            {formData.rating === 4 && "Satisfied"}
            {formData.rating === 5 && "Very Satisfied"}
          </p>
        )}
      </div>

      {/* Name and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            required
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="United States"
          />
        </div>
      </div>

      {/* Trip Type and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Type *
          </label>
          <select
            value={formData.tripType}
            onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select trip type</option>
            {tripTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Duration *
          </label>
          <select
            value={formData.tripDuration}
            onChange={(e) => setFormData({ ...formData, tripDuration: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select duration</option>
            {tripDurations.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={formData.reviewText}
          onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Tell us about your experience with our service..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.reviewText.length}/1000 characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || formData.rating === 0}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Review
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Reviews with 4-5 stars are auto-approved. Lower ratings will be reviewed by our team.
      </p>
    </form>
  );
}