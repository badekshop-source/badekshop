// src/app/(admin)/admin/orders/page.tsx
import { db } from "@/lib/db";
import { orders, products, profiles } from "@/lib/db/schema";
import { eq, desc, and, ilike, count, sql, or, inArray } from "drizzle-orm";
import Link from "next/link";
import { Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { OrdersExportWrapper } from "@/components/admin/orders-export-wrapper";

const ORDER_STATUSES = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminOrdersPage({
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
    whereClauses.push(eq(orders.orderStatus, status));
  }

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  const [ordersList, totalResult] = await Promise.all([
    db
      .select({
        order: orders,
        product: products,
        customer: profiles,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(profiles, eq(orders.userId, profiles.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(50),
    db.select({ count: count() }).from(orders).where(where),
  ]);

  type OrdersListResult = {
    order: typeof orders.$inferSelect;
    product: typeof products.$inferSelect | null;
    customer: typeof profiles.$inferSelect | null;
  };

  const typedOrdersList = ordersList as OrdersListResult[];
  const totalOrders = totalResult[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{totalOrders} total order{totalOrders !== 1 ? "s" : ""}</p>
        </div>
        <OrdersExportWrapper />
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
              {ORDER_STATUSES.map((s) => (
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
          { key: "product", label: "Product" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Order Status" },
          { key: "payment", label: "Payment" },
          { key: "date", label: "Date" },
          { key: "actions", label: "", className: "text-right" },
        ]}
        rows={typedOrdersList.map(({ order, product }) => ({
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
            product: product?.name ? (
              <span className="text-gray-600">{product.name}</span>
            ) : (
              <span className="text-gray-400">N/A</span>
            ),
            amount: <span className="font-medium">{formatCurrency(order.total)}</span>,
            status: <StatusBadge status={order.orderStatus ?? "pending"} />,
            payment: <StatusBadge status={order.paymentStatus ?? "pending"} />,
            date: <span className="text-gray-500">{formatDate(order.createdAt)}</span>,
            actions: (
              <div className="flex justify-end">
                <Link
                  href={`/admin/orders/${order.id}` as any}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </div>
            ),
          },
        }))}
        emptyMessage="No orders found"
      />
    </div>
  );
}
