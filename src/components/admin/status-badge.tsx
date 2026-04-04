import { cn } from "@/lib/utils";

type StatusType = "pending" | "paid" | "processing" | "approved" | "completed" | "cancelled" | "expired" | "rejected" | "failed" | "refunded" | "auto_approved" | "retry_1" | "retry_2" | "under_review" | "active" | "inactive";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  paid: "bg-blue-50 text-blue-700 ring-blue-600/20",
  processing: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  approved: "bg-green-50 text-green-700 ring-green-600/20",
  auto_approved: "bg-green-50 text-green-700 ring-green-600/20",
  completed: "bg-gray-50 text-gray-700 ring-gray-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  expired: "bg-orange-50 text-orange-700 ring-orange-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
  refunded: "bg-purple-50 text-purple-700 ring-purple-600/20",
  retry_1: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  retry_2: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  under_review: "bg-blue-50 text-blue-700 ring-blue-600/20",
  active: "bg-green-50 text-green-700 ring-green-600/20",
  inactive: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.replace(/\s+/g, "_").toLowerCase();
  const style = statusStyles[normalized] || "bg-gray-50 text-gray-700 ring-gray-600/20";
  const label = status.replace(/_/g, " ");

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", style, className)}>
      {label}
    </span>
  );
}
