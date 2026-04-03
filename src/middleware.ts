// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  // Allow images from Cloudinary and QR code services (preserving original CSP)
  const response = NextResponse.next();
  
  // Set Content Security Policy to allow external images
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https://res.cloudinary.com https://api.qrserver.com https://*.cloudinary.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.midtrans.com https://app.sandbox.midtrans.com; frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com;"
  );
  
  // Check if user is accessing admin routes
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminPath) {
    // Get session for admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session, redirect to login
    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user has admin role by querying the profiles table using email
    try {
      const userProfile = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.email, session.user.email))
        .limit(1);
      
      if (userProfile.length === 0 || userProfile[0].role !== 'admin') {
        // If user is not found or not admin, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Error checking user role in middleware:', error);
      // If there's an error checking role, redirect to login for security
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};