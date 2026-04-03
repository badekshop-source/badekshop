// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, and, asc, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';

// Define query parameters schema
const queryParamsSchema = z.object({
  category: z.enum(['all', 'esim', 'sim', 'sim_card']).optional().default('all'),
  search: z.string().optional(),
  active: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().default(true),
  sortBy: z.enum(['price', 'name', 'duration', 'createdAt']).optional().default('price'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database not connected' 
      }, 
      { status: 500 }
    );
  }
  
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Parse and validate query parameters
    const parsedParams = queryParamsSchema.safeParse(queryParams);
    if (!parsedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: parsedParams.error.issues 
        }, 
        { status: 400 }
      );
    }
    
    const { category, search, active, sortBy, sortOrder, limit, offset } = parsedParams.data;
    
    // Build dynamic query
    let query = db
      .select()
      .from(products);
    
    // Apply active filter
    query = query.where(eq(products.isActive, active));
    
    // Apply category filter if provided and not 'all'
    // Map 'sim' to 'sim_card' for database compatibility
    const dbCategory = category === 'sim' ? 'sim_card' : category;
    if (category && category !== 'all') {
      query = query.where(and(
        eq(products.isActive, active),
        eq(products.category, dbCategory)
      ));
    }
    
    // Apply search filter if provided
    if (search) {
      query = query.where(and(
        eq(products.isActive, active),
        ilike(products.name, `%${search}%`)
      ));
    }
    
    // Apply ordering
    let orderColumn;
    switch (sortBy) {
      case 'name':
        orderColumn = products.name;
        break;
      case 'duration':
        orderColumn = products.duration;
        break;
      case 'createdAt':
        orderColumn = products.createdAt;
        break;
      case 'price':
      default:
        orderColumn = products.price;
        break;
    }
    
    query = sortOrder === 'asc' 
      ? query.orderBy(asc(orderColumn))
      : query.orderBy(desc(orderColumn));
    
    // Apply pagination
    query = query.limit(limit).offset(offset);
    
    const productsList = await query;
    
    return NextResponse.json({ 
      success: true, 
      products: productsList,
      pagination: {
        limit,
        offset,
        total: productsList.length // Note: this is the count of returned items, not total in DB
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.issues 
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database not connected' 
      }, 
      { status: 500 }
    );
  }
  
  try {
    const { name, description, category, duration, size, price, stock } = await request.json();

    // Validate required fields
    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name, category, and price are required' 
        }, 
        { status: 400 }
      );
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        description,
        category,
        duration,
        size,
        price,
        stock: stock || 0,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      product: newProduct 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
      }, 
      { status: 500 }
    );
  }
}