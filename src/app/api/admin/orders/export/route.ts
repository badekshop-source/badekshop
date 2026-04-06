// src/app/api/admin/orders/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products, profiles } from "@/lib/db/schema";
import { eq, and, gte, lte, or, inArray, desc } from "drizzle-orm";
import { requireAdminAuth } from "@/lib/auth-utils";
import { generateCSV, generateXLSX, orderExportColumns, calculatePriority, formatDateForExport } from "@/lib/export";
import logger from "@/lib/logger";

interface ExportFilters {
  status?: string;
  kycStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  productType?: string;
  sortBy?: string;
}

function getDateRange(): { dateFrom: Date; dateTo: Date } {
  const dateFrom = new Date();
  dateFrom.setHours(0, 0, 0, 0);
  const dateTo = new Date(dateFrom);
  dateTo.setDate(dateTo.getDate() + 7);
  dateTo.setHours(23, 59, 59, 999);
  return { dateFrom, dateTo };
}

async function getAdminUser(request: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return null;

    const userProfile = await db
      .select({ id: profiles.id, role: profiles.role })
      .from(profiles)
      .where(eq(profiles.email, session.user.email))
      .limit(1);

    if (userProfile.length === 0 || userProfile[0].role !== "admin") {
      return null;
    }
    return { id: userProfile[0].id, email: session.user.email };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "xlsx";
    const status = searchParams.get("status") || "all";
    const kycStatus = searchParams.get("kycStatus") || "all";
    const productType = searchParams.get("productType") || "all";
    const sortBy = searchParams.get("sortBy") || "priority";

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");

    if (dateFromParam && dateToParam) {
      dateFrom = new Date(dateFromParam);
      dateTo = new Date(dateToParam);
      dateTo.setHours(23, 59, 59, 999);
    } else {
      const defaultRange = getDateRange();
      dateFrom = defaultRange.dateFrom;
      dateTo = defaultRange.dateTo;
    }

    const whereConditions = [];

    if (status !== "all") {
      whereConditions.push(eq(orders.orderStatus, status));
    }
    if (kycStatus !== "all") {
      whereConditions.push(eq(orders.kycStatus, kycStatus));
    }

    whereConditions.push(gte(orders.arrivalDate, dateFrom));
    whereConditions.push(lte(orders.arrivalDate, dateTo));

    if (productType !== "all") {
      whereConditions.push(eq(products.category, productType));
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const ordersData = await db
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
      .limit(1000);

    type OrderResult = {
      order: typeof orders.$inferSelect;
      product: typeof products.$inferSelect | null;
      customer: typeof profiles.$inferSelect | null;
    };

    const exportData = ordersData.map((item: OrderResult) => {
      const priority = calculatePriority({
        arrivalDate: item.order.arrivalDate,
        orderStatus: item.order.orderStatus,
        paymentStatus: item.order.paymentStatus,
        kycStatus: item.order.kycStatus,
      });

      const passportUrl = item.order.passportUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL || "https://badekshop.vercel.app"}/api/admin/kyc/${item.order.id}/passport`
        : "";

      const qrCodeUrl = item.order.qrCodeData
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`badekshop:${item.order.id}`)}`
        : "";

      return {
        priority,
        arrivalDate: formatDateForExport(item.order.arrivalDate),
        flightNumber: item.order.flightNumber || "",
        orderNumber: item.order.orderNumber,
        orderDate: formatDateForExport(item.order.createdAt),
        productType: item.product?.category || "N/A",
        productName: item.product?.name || "Unknown",
        duration: item.product?.duration || 0,
        totalAmount: item.order.total,
        customerName: item.order.fullName,
        nationality: item.order.nationality,
        customerEmail: item.order.customerEmail,
        customerPhone: item.order.customerPhone,
        imeiNumber: item.order.imeiNumber || "",
        kycStatus: item.order.kycStatus || "pending",
        passportUrl,
        orderStatus: item.order.orderStatus || "pending",
        paymentStatus: item.order.paymentStatus || "pending",
        qrCodeUrl,
      };
    });

    if (sortBy === "priority") {
      exportData.sort((a: { priority: number }, b: { priority: number }) => b.priority - a.priority);
    } else if (sortBy === "arrivalDate") {
      exportData.sort((a: { arrivalDate: string }, b: { arrivalDate: string }) => {
        const dateA = new Date(a.arrivalDate || 0);
        const dateB = new Date(b.arrivalDate || 0);
        return dateA.getTime() - dateB.getTime();
      });
    }

    logger.info("Export orders", {
      adminId: adminUser.id,
      format,
      recordCount: exportData.length,
      filters: { status, kycStatus, productType, sortBy, dateFrom, dateTo },
    });

    const filename = `badekshop-orders-${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      const csv = generateCSV(exportData, orderExportColumns);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      const buffer = await generateXLSX(exportData, orderExportColumns, {
        title: "Orders Export",
        statusColumn: "orderStatus",
      });
      return new NextResponse(Uint8Array.from(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      });
    }
  } catch (error) {
    logger.error("Export orders failed", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}