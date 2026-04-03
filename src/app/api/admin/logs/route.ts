import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const filter = searchParams.get('filter') || '';

    const [logs, count] = await Promise.all([
      db.auditLog.findMany({
        where: {
          action: {
            contains: filter,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.auditLog.count({
        where: {
          action: {
            contains: filter,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: count,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch logs',
    }, { status: 500 });
  }
}