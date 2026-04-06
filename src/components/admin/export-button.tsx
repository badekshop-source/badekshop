"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Calendar, Filter } from "lucide-react";

interface ExportButtonProps {
  onExport: (format: "csv" | "xlsx", filters: ExportFilters) => Promise<void>;
  isLoading?: boolean;
}

export interface ExportFilters {
  status: string;
  kycStatus: string;
  productType: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

const KYC_STATUS_OPTIONS = [
  { value: "all", label: "All KYC Status" },
  { value: "pending", label: "Pending" },
  { value: "auto_approved", label: "Auto Approved" },
  { value: "approved", label: "Approved" },
  { value: "under_review", label: "Under Review" },
  { value: "rejected", label: "Rejected" },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "esim", label: "eSIM" },
  { value: "sim_card", label: "Physical SIM" },
];

const SORT_OPTIONS = [
  { value: "priority", label: "Priority (Highest First)" },
  { value: "arrivalDate", label: "Arrival Date (Soonest First)" },
];

export function ExportButton({ onExport, isLoading }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [filters, setFilters] = useState<ExportFilters>(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return {
      status: "all",
      kycStatus: "all",
      productType: "all",
      dateFrom: today.toISOString().split("T")[0],
      dateTo: nextWeek.toISOString().split("T")[0],
      sortBy: "priority",
    };
  });

  const handleExport = async () => {
    await onExport(format, filters);
    setIsOpen(false);
  };

  const resetToDefault = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFilters({
      status: "all",
      kycStatus: "all",
      productType: "all",
      dateFrom: today.toISOString().split("T")[0],
      dateTo: nextWeek.toISOString().split("T")[0],
      sortBy: "priority",
    });
    setFormat("xlsx");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Export Orders</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Arrival Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Default: Today + 7 days</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Filter className="inline h-4 w-4 mr-1" />
                    Order Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                  <select
                    value={filters.kycStatus}
                    onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {KYC_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <select
                    value={filters.productType}
                    onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PRODUCT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFormat("xlsx")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        format === "xlsx"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="font-medium">Excel (.xlsx)</span>
                    </button>
                    <button
                      onClick={() => setFormat("csv")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        format === "csv"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={resetToDefault}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}