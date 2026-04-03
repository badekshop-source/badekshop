// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { desc, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdminAuth, unauthorizedResponse } from "@/lib/auth-utils";

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20),
  status: z.enum(["pending", "paid", "processing", "approved", "rejected", "expired", "cancelled", "completed"]).optional(),
  kycStatus: z.enum(["pending", "auto_approved", "retry_1", "retry_2", "under_review", "approved", "rejected"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "total"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  // Check admin authentication
  const session = await requireAdminAuth(request);
  if (!session) {
    return unauthorizedResponse("Admin authentication required");
  }

  try {
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));
    
    const offset = (params.page - 1) * params.limit;
    
    // Build base query
    let query = db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      fullName: orders.fullName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      nationality: orders.nationality,
      arrivalDate: orders.arrivalDate,
      flightNumber: orders.flightNumber,
      quantity: orders.quantity,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      orderStatus: orders.orderStatus,
      kycStatus: orders.kycStatus,
      kycAttempts: orders.kycAttempts,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      product: {
        id: products.id,
        name: products.name,
        category: products.category,
      },
    })
    .from(orders)
    .leftJoin(products, eq(orders.productId, products.id));

    // Apply filters
    if (params.status) {
      query = query.where(eq(orders.orderStatus, params.status));
    }
    
    if (params.kycStatus) {
      query = query.where(eq(orders.kycStatus, params.kycStatus));
    }
    
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      query = query.where(
        sql`${orders.orderNumber} ILIKE ${searchTerm} OR ${orders.fullName} ILIKE ${searchTerm} OR ${orders.customerEmail} ILIKE ${searchTerm}`
      );
    }

    // Apply sorting
    const sortColumn = params.sortBy === "total" ? orders.total :
                      params.sortBy === "updatedAt" ? orders.updatedAt :
                      orders.createdAt;
    
    query = params.sortOrder === "asc" 
      ? query.orderBy(asc(sortColumn))
      : query.orderBy(desc(sortColumn));

    // Execute count query for pagination
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(orders);
    const totalCount = countResult[0]?.count || 0;

    // Execute main query with pagination
    const ordersList = await query.limit(params.limit).offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        orders: ordersList,
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / params.limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
