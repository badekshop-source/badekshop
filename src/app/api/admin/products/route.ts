// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc, asc, eq } from "drizzle-orm";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["esim", "sim_card"]),
  duration: z.number().int().positive().optional(),
  size: z.enum(["nano", "micro", "standard"]).optional(),
  price: z.number().int().positive(),
  discountPercentage: z.number().int().min(0).max(100).default(0),
  discountStart: z.string().optional(),
  discountEnd: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).optional(),
  badge: z.enum(["popular", "best_value", "new", "limited", ""]).nullable().optional().transform(v => v === "" ? null : v),
});

// GET /api/admin/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    const productsList = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db.select({ count: db.fn.count() }).from(products);
    const totalCount = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        products: productsList,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Convert date strings to Date objects for Drizzle
    const insertData: Record<string, any> = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (validatedData.discountStart) {
      insertData.discountStart = new Date(validatedData.discountStart);
    }
    if (validatedData.discountEnd) {
      insertData.discountEnd = new Date(validatedData.discountEnd);
    }

    const newProduct = await db
      .insert(products)
      .values(insertData)
      .returning();

    return NextResponse.json({
      success: true,
      data: newProduct[0],
      message: "Product created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid product data", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
