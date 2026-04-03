// src/app/api/admin/kyc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { desc, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20),
  status: z.enum(["pending", "retry_1", "retry_2", "under_review", "approved", "rejected"]).optional(),
  sortBy: z.enum(["createdAt", "kycAttempts"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));
    
    const offset = (params.page - 1) * params.limit;

    // Build query for orders with KYC issues
    let query = db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      fullName: orders.fullName,
      customerEmail: orders.customerEmail,
      nationality: orders.nationality,
      arrivalDate: orders.arrivalDate,
      orderStatus: orders.orderStatus,
      kycStatus: orders.kycStatus,
      kycAttempts: orders.kycAttempts,
      passportUrl: orders.passportUrl,
      passportPublicId: orders.passportPublicId,
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

    // Filter by KYC status
    if (params.status) {
      query = query.where(eq(orders.kycStatus, params.status));
    } else {
      // Default: show pending and under_review
      query = query.where(
        sql`${orders.kycStatus} IN ('pending', 'retry_1', 'retry_2', 'under_review')`
      );
    }

    // Apply sorting
    const sortColumn = params.sortBy === "kycAttempts" ? orders.kycAttempts : orders.createdAt;
    
    query = params.sortOrder === "asc" 
      ? query.orderBy(asc(sortColumn))
      : query.orderBy(desc(sortColumn));

    // Execute count query
    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        params.status 
          ? eq(orders.kycStatus, params.status)
          : sql`${orders.kycStatus} IN ('pending', 'retry_1', 'retry_2', 'under_review')`
      );
    
    const countResult = await countQuery;
    const totalCount = countResult[0]?.count || 0;

    // Execute main query with pagination
    const kycList = await query.limit(params.limit).offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        kycOrders: kycList,
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / params.limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching KYC list:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch KYC list" },
      { status: 500 }
    );
  }
}
