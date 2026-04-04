// src/app/(admin)/admin/orders/[id]/page.tsx
import { db } from "@/lib/db";
import { orders, products, kycDocuments, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Plane, CreditCard, FileText, Package, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderActions } from "./order-actions";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id: orderId } = await params;

  const orderResult = await db
    .select({
      order: orders,
      product: products,
      kycDoc: kycDocuments,
      customer: profiles,
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id))
    .leftJoin(kycDocuments, eq(orders.id, kycDocuments.orderId))
    .leftJoin(profiles, eq(orders.userId, profiles.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderResult.length) {
    redirect("/admin/orders" as any);
  }

  const { order, product, kycDoc } = orderResult[0];

  const timelineItems = [
    { icon: Package, label: "Order Created", detail: formatDateTime(order.createdAt), color: "text-blue-600", bg: "bg-blue-100", completed: true },
    ...(order.paymentStatus !== "pending"
      ? [{ icon: CreditCard, label: `Payment ${order.paymentStatus === "paid" ? "Confirmed" : order.paymentStatus}`, detail: order.paymentMethod ? `via ${order.paymentMethod}` : undefined, color: order.paymentStatus === "paid" ? "text-green-600" : "text-red-600", bg: order.paymentStatus === "paid" ? "bg-green-100" : "bg-red-100", completed: true }]
      : []),
    ...(order.kycStatus !== "pending"
      ? [{ icon: FileText, label: `KYC ${order.kycStatus.replace("_", " ")}`, detail: `${order.kycAttempts} attempt(s)`, color: "text-yellow-600", bg: "bg-yellow-100", completed: true }]
      : []),
    ...(order.orderStatus === "completed"
      ? [{ icon: CheckCircle2, label: "Order Completed", detail: formatDateTime(order.updatedAt), color: "text-green-600", bg: "bg-green-100", completed: true }]
      : order.orderStatus === "cancelled" || order.orderStatus === "rejected"
        ? [{ icon: XCircle, label: `Order ${order.orderStatus}`, detail: formatDateTime(order.updatedAt), color: "text-red-600", bg: "bg-red-100", completed: true }]
        : [{ icon: Clock, label: "Awaiting completion", detail: "", color: "text-gray-400", bg: "bg-gray-100", completed: false }]),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">Created {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.orderStatus ?? "pending"} />
          <StatusBadge status={order.paymentStatus ?? "pending"} />
          <StatusBadge status={order.kycStatus ?? "pending"} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{product?.name || "N/A"}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product?.description || "No description"}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="outline" className="capitalize">{product?.category || "N/A"}</Badge>
                    {product?.duration && <Badge variant="outline">{product.duration} days</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                KYC Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={order.kycStatus ?? "pending"} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attempts</p>
                  <p className="font-medium mt-1">{order.kycAttempts} / 3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passport</p>
                  {order.passportUrl ? (
                    <a href={order.passportUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                      View Document
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">Not uploaded</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">IMEI</p>
                  <p className="font-medium mt-1 font-mono text-sm">{order.imeiNumber || "Not provided"}</p>
                </div>
              </div>
              {order.kycStatus === "under_review" && (
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/admin/kyc/${order.id}` as any} className="text-sm text-blue-600 hover:underline font-medium">
                    Review KYC &rarr;
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", item.bg)}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      {item.detail && <p className="text-xs text-gray-500">{item.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Name" value={order.fullName} />
              <InfoRow label="Email" value={order.customerEmail} />
              <InfoRow label="Phone" value={order.customerPhone} />
              <InfoRow label="Nationality" value={order.nationality} />
            </CardContent>
          </Card>

          {/* Travel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="h-5 w-5 text-gray-400" />
                Travel Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Arrival" value={formatDate(order.arrivalDate)} />
              <InfoRow label="Flight" value={order.flightNumber} />
              <InfoRow label="Outlet" value={order.activationOutlet} />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-400" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Method" value={order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : "N/A"} />
              <InfoRow label="Status" value={<StatusBadge status={order.paymentStatus ?? "pending"} />} />
              <InfoRow label="Midtrans ID" value={order.paymentGatewayId || "N/A"} />
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund */}
          {order.refundStatus && order.refundStatus !== "none" && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Refund
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Status" value={<StatusBadge status={order.refundStatus} />} />
                {order.refundAmount && <InfoRow label="Amount" value={formatCurrency(order.refundAmount)} />}
                {order.refundReason && <InfoRow label="Reason" value={order.refundReason} />}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <OrderActions orderId={order.id} currentOrderStatus={order.orderStatus ?? "pending"} orderTotal={order.total} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
