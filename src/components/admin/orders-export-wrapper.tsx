"use client";

import { useState } from "react";
import { ExportButton, ExportFilters } from "./export-button";

export function OrdersExportWrapper() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (format: "csv" | "xlsx", filters: ExportFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("format", format);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.kycStatus !== "all") params.set("kycStatus", filters.kycStatus);
      if (filters.productType !== "all") params.set("productType", filters.productType);
      params.set("dateFrom", filters.dateFrom);
      params.set("dateTo", filters.dateTo);
      params.set("sortBy", filters.sortBy);

      const response = await fetch(`/api/admin/orders/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `badekshop-orders-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return <ExportButton onExport={handleExport} isLoading={isLoading} />;
}