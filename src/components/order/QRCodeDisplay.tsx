// src/components/order/QRCodeDisplay.tsx
"use client";

import { OrderStatus } from "@/types";
import { QrCode, Download, Mail, MapPin } from "lucide-react";

interface QRCodeDisplayProps {
  qrCodeData: string;
  orderStatus: OrderStatus;
  activationOutlet: string;
}

export function QRCodeDisplay({
  qrCodeData,
  orderStatus,
  activationOutlet,
}: QRCodeDisplayProps) {
  // Generate QR code URL using a QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrCodeData
  )}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `badekshop-qr-${orderStatus}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Your Activation QR Code</h3>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 text-sm">
          Your KYC has been approved! Show this QR code at {activationOutlet} to collect your
          SIM/eSIM.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* QR Code Image */}
        <div className="flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
            <img
              src={qrCodeUrl}
              alt="Activation QR Code"
              className="w-64 h-64"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Pickup Location</p>
                <p className="text-gray-600 text-sm">{activationOutlet}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">What to bring</p>
                <p className="text-gray-600 text-sm">
                  Show this QR code and your passport at the counter
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Email Backup</p>
                <p className="text-gray-600 text-sm">
                  We've also sent this QR code to your email for safekeeping
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Screenshot or save this QR code for easy access</li>
          <li>QR code is valid for 30 days from order date</li>
          <li>Bring your passport for verification at pickup</li>
          <li>Operating hours: 24/7 at Ngurah Rai International Airport</li>
        </ul>
      </div>
    </div>
  );
}