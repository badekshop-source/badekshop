// src/components/reviews/ReviewCard.tsx
import { Star, MapPin, Briefcase, Users, User } from "lucide-react";
import { TripType } from "@/types";

interface ReviewCardProps {
  userName: string;
  country: string;
  rating: number;
  tripType: TripType;
  tripDuration: string;
  reviewText: string;
  reviewedAt: Date | string;
}

const tripTypeIcons: Record<TripType, typeof Briefcase> = {
  business: Briefcase,
  leisure: MapPin,
  family: Users,
  solo: User,
};

const tripTypeLabels: Record<TripType, string> = {
  business: "Business Trip",
  leisure: "Leisure",
  family: "Family Trip",
  solo: "Solo Travel",
};

export function ReviewCard({
  userName,
  country,
  rating,
  tripType,
  tripDuration,
  reviewText,
  reviewedAt,
}: ReviewCardProps) {
  const TripIcon = tripTypeIcons[tripType];
  const date = typeof reviewedAt === "string" ? new Date(reviewedAt) : reviewedAt;

  // Format trip duration
  const formatDuration = (duration: string) => {
    switch (duration) {
      case "1-3":
        return "1-3 days";
      case "4-7":
        return "4-7 days";
      case "8-14":
        return "8-14 days";
      case "15+":
        return "15+ days";
      default:
        return duration;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{userName}</h4>
          <p className="text-sm text-gray-500">{country}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trip Info */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <TripIcon className="w-4 h-4" />
          <span>{tripTypeLabels[tripType]}</span>
        </div>
        <span className="text-gray-300">|</span>
        <span>{formatDuration(tripDuration)}</span>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 leading-relaxed mb-4">{reviewText}</p>

      {/* Date */}
      <p className="text-xs text-gray-400">
        Reviewed on {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}