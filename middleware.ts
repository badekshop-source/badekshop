// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set Content Security Policy to allow external images
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com https://api.qrserver.com https://*.cloudinary.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.midtrans.com https://app.sandbox.midtrans.com; frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com;"
  );
  
  // Only check auth for /admin paths but exclude /admin/login
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  
  // Skip for login page
  if (isLoginPage) {
    return response;
  }
  
  // For other admin paths, check session
  if (isAdminPath) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};