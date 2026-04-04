import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          <span className={cn("text-sm font-medium", trend.direction === "up" ? "text-green-600" : "text-red-600")}>
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-sm text-gray-500">from last month</span>
        </div>
      )}
      {description && <p className="text-xs text-gray-500 mt-3">{description}</p>}
    </div>
  );
}
