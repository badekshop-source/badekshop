// src/components/order/KycUploadSection.tsx
"use client";

import { useState, useRef } from "react";
import { KycStatus } from "@/types";
import { Upload, AlertCircle, CheckCircle, RefreshCw, Camera } from "lucide-react";

interface KycUploadSectionProps {
  orderId: string;
  kycStatus: KycStatus;
  kycAttempts: number;
  passportUrl: string | null;
  imeiNumber: string | null;
  hasToken: boolean;
  token: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function KycUploadSection({
  orderId,
  kycStatus,
  kycAttempts,
  passportUrl,
  imeiNumber,
  hasToken,
  token,
}: KycUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(passportUrl);
  const [imei, setImei] = useState<string>(imeiNumber || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file, imei);
  };

  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    
    // Limit to 15 digits
    if (value.length > 15) {
      value = value.slice(0, 15);
    }
    
    setImei(value);
  };

  const uploadFile = async (file: File, imeiValue: string) => {
    setIsUploading(true);
    setError(null);

    // Validate IMEI if not already provided
    if (!imeiValue && kycStatus === "pending") {
      setError("Please enter your device's IMEI number (15 digits)");
      setIsUploading(false);
      return;
    }

    // Validate IMEI format (15 digits)
    if (imeiValue && !/^\d{15}$/.test(imeiValue)) {
      setError("IMEI must be exactly 15 digits");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", orderId);
      formData.append("token", token);
      formData.append("imei", imeiValue); // Add IMEI to the upload

      const response = await fetch("/api/kyc/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Refresh page to show updated status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (kycStatus) {
      case "pending":
        return {
          title: "Upload Passport",
          message: "Please upload a clear photo of your passport information page to proceed with activation.",
          color: "blue",
          showUpload: true,
        };
      case "auto_approved":
        return {
          title: "Passport Verified",
          message: "Your passport has been verified successfully! Processing your order...",
          color: "green",
          showUpload: false,
        };
      case "retry_1":
        return {
          title: "Upload Failed - Retry 1 of 3",
          message: "Oops! The photo seems a bit blurry. Please try again in a brighter area to speed up your activation.",
          color: "yellow",
          showUpload: true,
        };
      case "retry_2":
        return {
          title: "Upload Failed - Retry 2 of 3",
          message: "The photo is still unclear, but don't worry! Your order is still being processed. Our team will manually verify your photo now.",
          color: "orange",
          showUpload: true,
        };
      case "under_review":
        return {
          title: "Under Manual Review",
          message: "Your document is being reviewed by our team. This usually takes 1-2 business hours.",
          color: "blue",
          showUpload: false,
        };
      case "approved":
        return {
          title: "KYC Approved",
          message: "Your identity has been verified successfully!",
          color: "green",
          showUpload: false,
        };
      case "rejected":
        return {
          title: "KYC Rejected",
          message: "Your document was rejected. Please contact our support team for assistance.",
          color: "red",
          showUpload: false,
        };
      default:
        return {
          title: "KYC Status",
          message: "",
          color: "gray",
          showUpload: false,
        };
    }
  };

  const status = getStatusDisplay();
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  };

  if (kycStatus === "approved" || kycStatus === "rejected") {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Identity Verification (KYC)</h3>

      <div className={`p-4 rounded-lg border mb-6 ${colorClasses[status.color as keyof typeof colorClasses]}`}>
        <div className="flex items-start gap-3">
          {status.color === "green" ? (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : kycStatus.includes("retry") ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <Upload className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">{status.title}</p>
            <p className="text-sm mt-1 opacity-90">{status.message}</p>
          </div>
        </div>
      </div>

      {status.showUpload && (
        <div>
          {/* Photo Quality Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Camera className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-900 mb-1">Photo Tips for Faster Activation</p>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li>• Ensure text is clear and readable</li>
                  <li>• Avoid glare or reflections</li>
                  <li>• Include all four corners of the passport</li>
                  <li>• Good lighting speeds up outlet verification</li>
                </ul>
              </div>
            </div>
          </div>

          {/* IMEI Input Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device IMEI Number *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={imei}
              onChange={handleImeiChange}
              placeholder="Enter 15-digit IMEI number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={17} /* Including spaces for formatting */
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your device's 15-digit IMEI number. This is required for eSIM/SIM activation.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isUploading}
          />

          {previewUrl ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="relative w-full max-w-md">
                <img
                  src={previewUrl}
                  alt="Passport preview"
                  className="w-full h-auto rounded-lg border border-gray-200"
                  crossOrigin="anonymous"
                />
                {kycStatus !== "under_review" && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-2 right-2 bg-white text-gray-700 px-3 py-1 rounded-md text-sm font-medium shadow-md hover:bg-gray-50 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Change
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors flex flex-col items-center gap-3"
            >
              <Upload className="w-10 h-10 text-gray-400" />
              <span className="text-gray-600 font-medium">
                {isUploading ? "Uploading..." : "Click to upload passport photo"}
              </span>
              <span className="text-sm text-gray-400">
                JPEG, PNG, or WebP (max 5MB)
              </span>
            </button>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure good lighting with no shadows</li>
              <li>Capture the entire passport page clearly</li>
              <li>Make sure text is readable and not blurry</li>
              <li>Avoid glare or reflections on the document</li>
            </ul>
          </div>
        </div>
      )}

      {passportUrl && kycStatus !== "pending" && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Document submitted. Status: {" "}
            <span className="font-medium capitalize">{kycStatus.replace("_", " ")}</span>
          </p>
        </div>
      )}
    </div>
  );
}