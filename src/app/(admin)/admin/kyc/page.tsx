// src/app/(admin)/admin/kyc/page.tsx
import { db } from "@/lib/db";
import { orders, kycDocuments, profiles } from "@/lib/db/schema";
import { eq, desc, and, ilike, sql, count, or, inArray } from "drizzle-orm";
import Link from "next/link";
import { Search, Filter, Eye, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/utils";

const KYC_STATUSES = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "auto_approved", label: "Auto Approved" },
  { value: "retry_1", label: "Retry 1" },
  { value: "retry_2", label: "Retry 2" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminKycPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  if (!db) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Database Connection Error</p>
        <p className="text-sm mt-1">Please check your environment variables.</p>
      </div>
    );
  }

  const { search, status } = await searchParams;

  const whereClauses = [];
  if (search) {
    whereClauses.push(
      or(
        ilike(orders.orderNumber, `%${search}%`),
        ilike(orders.fullName, `%${search}%`),
        ilike(orders.customerEmail, `%${search}%`)
      )
    );
  }
  if (status) {
    whereClauses.push(eq(orders.kycStatus, status));
  }

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const [kycList, totalResult] = await Promise.all([
    db
      .select({
        order: orders,
        kycDoc: kycDocuments,
        customer: profiles,
      })
      .from(orders)
      .leftJoin(kycDocuments, eq(orders.id, kycDocuments.orderId))
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .where(where)
      .orderBy(desc(orders.updatedAt))
      .limit(50),
    db.select({ count: count() }).from(orders).where(where),
  ]);

  type KYCListResult = {
    order: typeof orders.$inferSelect;
    kycDoc: typeof kycDocuments.$inferSelect | null;
    customer: typeof profiles.$inferSelect | null;
  };

  const typedKycList = kycList as KYCListResult[];
  const totalKYC = totalResult[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-sm text-gray-500 mt-1">{totalKYC} record{totalKYC !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by order #, name, or email..."
              defaultValue={search}
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {KYC_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        headers={[
          { key: "order", label: "Order" },
          { key: "customer", label: "Customer" },
          { key: "passport", label: "Passport" },
          { key: "imei", label: "IMEI" },
          { key: "status", label: "KYC Status" },
          { key: "attempts", label: "Attempts" },
          { key: "date", label: "Updated" },
          { key: "actions", label: "", className: "text-right" },
        ]}
        rows={typedKycList.map(({ order }) => ({
          id: order.id,
          cells: {
            order: (
              <span className="font-medium text-gray-900">{order.orderNumber}</span>
            ),
            customer: (
              <div>
                <p className="font-medium text-gray-900">{order.fullName}</p>
                <p className="text-xs text-gray-500">{order.customerEmail}</p>
              </div>
            ),
            passport: order.passportUrl ? (
              <a href={order.passportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                View
              </a>
            ) : (
              <span className="text-gray-400 text-sm">Not uploaded</span>
            ),
            imei: (
              <span className="font-mono text-sm">{order.imeiNumber || "N/A"}</span>
            ),
            status: <StatusBadge status={order.kycStatus ?? "pending"} />,
            attempts: (
              <span className={(order.kycAttempts ?? 0) >= 3 ? "text-red-600 font-medium" : "text-gray-600"}>
                {order.kycAttempts ?? 0} / 3
              </span>
            ),
            date: <span className="text-gray-500">{formatDate(order.updatedAt)}</span>,
            actions: (
              <div className="flex justify-end">
                <Link
                  href={`/admin/kyc/${order.id}` as any}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {order.kycStatus === "under_review" ? "Review" : "View"}
                </Link>
              </div>
            ),
          },
        }))}
        emptyMessage="No KYC records found"
      />
    </div>
  );
}
