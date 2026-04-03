// src/lib/currency.ts
/**
 * Format amount in cents to currency string
 * e.g., 100000 -> "Rp 1.000.000"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp 0";
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount without currency symbol
 * e.g., 100000 -> "1.000.000"
 */
export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "0";
  
  return new Intl.NumberFormat("id-ID").format(amount);
}