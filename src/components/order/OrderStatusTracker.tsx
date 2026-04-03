// src/components/order/OrderStatusTracker.tsx
"use client";

import { OrderStatus, KycStatus } from "@/types";
import { CheckCircle, Clock, AlertCircle, XCircle, FileCheck } from "lucide-react";

interface OrderStatusTrackerProps {
  orderStatus: OrderStatus;
  kycStatus: KycStatus;
  kycAttempts: number;
}

const orderSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "paid", label: "Payment Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: FileCheck },
  { key: "completed", label: "Completed", icon: CheckCircle },
];

export function OrderStatusTracker({
  orderStatus,
  kycStatus,
  kycAttempts,
}: OrderStatusTrackerProps) {
  const getStepStatus = (stepKey: string) => {
    const stepOrder = ["pending", "paid", "processing", "completed"];
    const currentIndex = stepOrder.indexOf(orderStatus);
    const stepIndex = stepOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getKycMessage = () => {
    switch (kycStatus) {
      case "pending":
        return "Please upload your passport for verification.";
      case "auto_approved":
        return "Your passport has been auto-approved!";
      case "retry_1":
        return "Oops! The photo seems a bit blurry. Please try again in a brighter area to speed up your activation.";
      case "retry_2":
        return "The photo is still unclear, but don't worry! Your order is still being processed. Our team will manually verify your photo now.";
      case "under_review":
        return "Your document is under manual review by our team.";
      case "approved":
        return "Your KYC has been approved! Check your QR code below.";
      case "rejected":
        return "Your KYC was rejected. Please contact support for assistance.";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    if (orderStatus === "cancelled" || orderStatus === "expired" || kycStatus === "rejected") {
      return "text-red-600 bg-red-50 border-red-200";
    }
    if (kycStatus === "approved" || orderStatus === "completed") {
      return "text-green-600 bg-green-50 border-green-200";
    }
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step.key);

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    status === "completed"
                      ? "bg-green-500 text-white"
                      : status === "current"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    status === "completed"
                      ? "text-green-600"
                      : status === "current"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${
                (orderSteps.findIndex((s) => s.key === orderStatus) /
                  (orderSteps.length - 1)) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className={`mt-6 p-4 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-start gap-3">
          {kycStatus === "rejected" || orderStatus === "cancelled" ? (
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : kycStatus === "approved" || orderStatus === "completed" ? (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : kycStatus === "under_review" || kycStatus.includes("retry") ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">
              {orderStatus === "cancelled"
                ? "Order Cancelled"
                : orderStatus === "expired"
                ? "Order Expired"
                : kycStatus === "rejected"
                ? "KYC Rejected"
                : kycStatus === "approved"
                ? "KYC Approved"
                : "Processing Order"}
            </p>
            <p className="text-sm mt-1 opacity-90">{getKycMessage()}</p>
            {kycAttempts > 0 && kycStatus !== "approved" && kycStatus !== "rejected" && (
              <p className="text-sm mt-2 opacity-75">
                Attempt {kycAttempts} of 3
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}