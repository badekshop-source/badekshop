"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Star, Check, X, Eye, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ReviewItem {
  id: string;
  orderId: string;
  orderNumber: string | null;
  userName: string;
  userEmail: string;
  country: string;
  rating: number;
  tripType: string;
  tripDuration: string;
  reviewText: string;
  isApproved: boolean | null;
  reviewedAt: Date | string;
  createdAt: Date | string;
}

interface ReviewsClientPageProps {
  initialReviews: ReviewItem[];
  pendingCount: number;
}

export function ReviewsClientPage({ initialReviews, pendingCount }: ReviewsClientPageProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this review? It will be shown on the landing page.")) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to approve review");
      }

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve review");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this review? It will not be shown on the landing page.")) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to reject review");
      }

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject review");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete review");
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    // Status filter
    if (filter === "approved" && !review.isApproved) return false;
    if (filter === "pending" && review.isApproved) return false;

    // Rating filter
    if (ratingFilter !== null && review.rating !== ratingFilter) return false;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        review.userName.toLowerCase().includes(search) ||
        review.userEmail.toLowerCase().includes(search) ||
        review.country.toLowerCase().includes(search) ||
        review.reviewText.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const tripTypeLabels: Record<string, string> = {
    business: "Business",
    leisure: "Leisure",
    family: "Family",
    solo: "Solo",
  };

  const tripDurationLabels: Record<string, string> = {
    "1-3": "1-3 days",
    "4-7": "4-7 days",
    "8-14": "8-14 days",
    "15+": "15+ days",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} total
            {pendingCount > 0 && (
              <span className="ml-2">
                • <span className="text-yellow-600 font-medium">{pendingCount} pending</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <div className="flex gap-1">
            {(["all", "approved", "pending"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rating:</span>
          <div className="flex gap-1">
            {[null, 5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating?.toString() || "all"}
                onClick={() => setRatingFilter(rating)}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                  ratingFilter === rating
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating ? (
                  <>
                    <Star className="h-3 w-3 fill-current" />
                    {rating}
                  </>
                ) : (
                  "All"
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
        />
      </div>

      {/* Table */}
      <DataTable
        headers={[
          { key: "customer", label: "Customer" },
          { key: "rating", label: "Rating" },
          { key: "review", label: "Review" },
          { key: "trip", label: "Trip Details" },
          { key: "status", label: "Status" },
          { key: "date", label: "Date" },
          { key: "actions", label: "", className: "text-right" },
        ]}
        rows={filteredReviews.map((review) => ({
          id: review.id,
          cells: {
            customer: (
              <div>
                <p className="font-medium text-gray-900">{review.userName}</p>
                <p className="text-xs text-gray-500">{review.userEmail}</p>
                <p className="text-xs text-gray-400">{review.country}</p>
              </div>
            ),
            rating: (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            ),
            review: (
              <div className="max-w-md">
                <p className="text-sm text-gray-700 line-clamp-2">{review.reviewText}</p>
                {review.orderNumber && (
                  <p className="text-xs text-gray-400 mt-1">Order: {review.orderNumber}</p>
                )}
              </div>
            ),
            trip: (
              <div className="text-sm">
                <p>{tripTypeLabels[review.tripType] || review.tripType}</p>
                <p className="text-gray-500">{tripDurationLabels[review.tripDuration] || review.tripDuration}</p>
              </div>
            ),
            status: (
              <StatusBadge
                status={review.isApproved ? "approved" : "pending"}
              />
            ),
            date: (
              <div className="text-sm">
                <p>{format(new Date(review.createdAt), "MMM d, yyyy")}</p>
              </div>
            ),
            actions: (
              <div className="flex items-center justify-end gap-2">
                {!review.isApproved ? (
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={processingId === review.id}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                    title="Approve"
                  >
                    {processingId === review.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={processingId === review.id}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md disabled:opacity-50"
                    title="Reject"
                  >
                    {processingId === review.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={processingId === review.id}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  title="Delete"
                >
                  {processingId === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ),
          },
        }))}
      />

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No reviews found</p>
        </div>
      )}
    </div>
  );
}