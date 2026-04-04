// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  try {
    // Fetch product by ID
    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!productResult.length) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const product = productResult[0];

    // Check if product is active
    if (!product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product is not available" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        duration: product.duration,
        size: product.size,
        price: product.price,
        discountPercentage: product.discountPercentage,
        discountStart: product.discountStart,
        discountEnd: product.discountEnd,
        stock: product.stock,
        isActive: product.isActive,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}