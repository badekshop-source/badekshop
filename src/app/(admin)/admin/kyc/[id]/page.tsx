// src/app/(admin)/admin/kyc/[id]/page.tsx
import { db } from "@/lib/db";
import { orders, kycDocuments, profiles, adminLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArrowLeft, FileText, Smartphone, User, Plane, CreditCard, Clock } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminKycDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminKycDetailPage({ params }: AdminKycDetailPageProps) {
  const { id: orderId } = await params;

  const orderResult = await db
    .select({
      order: orders,
      kycDoc: kycDocuments,
      customer: profiles,
    })
    .from(orders)
    .leftJoin(kycDocuments, eq(orders.id, kycDocuments.orderId))
    .leftJoin(profiles, eq(orders.userId, profiles.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderResult.length) {
    redirect("/admin/kyc" as any);
  }

  const { order, kycDoc } = orderResult[0];

  const approveKyc = async () => {
    "use server";

    const headersList = await import("next/headers");
    const h = await headersList.headers();
    const session = await auth.api.getSession({ headers: h });
    if (!session) throw new Error("Unauthorized");

    const adminId = session.user.id;

    await db
      .update(orders)
      .set({
        kycStatus: "approved",
        orderStatus: "approved",
        qrCodeData: `badekshop:${orderId}`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    if (kycDoc) {
      try {
        await db
          .update(kycDocuments)
          .set({
            verificationStatus: "approved",
            updatedAt: new Date(),
          })
          .where(eq(kycDocuments.id, kycDoc.id));
      } catch (kycError) {
        console.error("Failed to update kyc_documents:", kycError);
      }
    }

    await db.insert(adminLogs).values({
      adminId,
      action: "approve_kyc",
      targetId: orderId,
      targetType: "order",
      details: { orderId, previousStatus: order.kycStatus, newStatus: "approved" },
    });

    // Trigger KYC approved email
    import("@/lib/workflows").then(workflows => {
      workflows.sendKycApprovedNotification(orderId).catch(console.error);
    });

    redirect(`/admin/kyc/${orderId}` as any);
  };

  const rejectKyc = async (formData: FormData) => {
    "use server";

    const headersList = await import("next/headers");
    const h = await headersList.headers();
    const session = await auth.api.getSession({ headers: h });
    if (!session) throw new Error("Unauthorized");

    const reason = formData.get("reason") as string;
    const adminId = session.user.id;

    await db
      .update(orders)
      .set({
        kycStatus: "rejected",
        orderStatus: "rejected",
        refundStatus: "requested",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    if (kycDoc) {
      try {
        await db
          .update(kycDocuments)
          .set({
            verificationStatus: "rejected",
            verificationNotes: reason,
            updatedAt: new Date(),
          })
          .where(eq(kycDocuments.id, kycDoc.id));
      } catch (kycError) {
        console.error("Failed to update kyc_documents:", kycError);
      }
    }

    await db.insert(adminLogs).values({
      adminId,
      action: "reject_kyc",
      targetId: orderId,
      targetType: "order",
      details: { orderId, previousStatus: order.kycStatus, newStatus: "rejected", reason },
    });

    // Trigger refund workflow
    import("@/lib/workflows").then(workflows => {
      workflows.processOrderStatusUpdate(orderId, "rejected", order.kycStatus ?? "pending").catch(console.error);
    });

    redirect(`/admin/kyc/${orderId}` as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/kyc" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KYC Review</h1>
            <p className="text-sm text-gray-500 mt-1">{order.orderNumber}</p>
          </div>
        </div>
        <StatusBadge status={order.kycStatus ?? "pending"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Passport */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Passport Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.passportUrl ? (
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={order.passportUrl}
                      alt="Passport document"
                      className="w-full h-auto max-h-96 object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <a
                    href={order.passportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open in new tab &rarr;
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No passport document uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-gray-400" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="IMEI Number" value={<span className="font-mono">{order.imeiNumber || "Not provided"}</span>} />
              <InfoRow label="Document Type" value="Passport" />
            </CardContent>
          </Card>

          {/* Actions */}
          {order.passportUrl && !["approved", "rejected", "cancelled"].includes(order.kycStatus ?? "") && (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Verification Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <form action={approveKyc} className="flex-1">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Approve KYC
                    </Button>
                  </form>
                  <form action={rejectKyc} className="flex-1 space-y-3">
                    <select
                      name="reason"
                      required
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select rejection reason</option>
                      <option value="blurry_image">Blurry or unclear image</option>
                      <option value="document_expired">Document expired</option>
                      <option value="mismatch_info">Info doesn&apos;t match passport</option>
                      <option value="fake_document">Fake document detected</option>
                      <option value="other">Other reason</option>
                    </select>
                    <Button type="submit" variant="destructive" className="w-full">
                      Reject KYC
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Order #" value={order.orderNumber} />
              <InfoRow label="Amount" value={formatCurrency(order.total)} />
              <InfoRow label="Order Status" value={<StatusBadge status={order.orderStatus ?? "pending"} />} />
              <InfoRow label="Payment" value={<StatusBadge status={order.paymentStatus ?? "pending"} />} />
            </CardContent>
          </Card>

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

          {/* KYC History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                KYC History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Status" value={<StatusBadge status={order.kycStatus ?? "pending"} />} />
              <InfoRow label="Attempts" value={`${order.kycAttempts} / 3`} />
              <InfoRow label="Last Updated" value={formatDateTime(order.updatedAt)} />
            </CardContent>
          </Card>
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
