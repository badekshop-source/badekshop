// src/app/(admin)/admin/layout.tsx
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify authentication using better-auth
  const headersList = await headers();
  
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      redirect('/admin/login' as any);
    }

    // Verify user is admin
    const user = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1);

    if (!user.length || user[0].role !== 'admin') {
      redirect('/' as any);
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-blue-600">badekshop Admin</span>
                </div>
                <div className="ml-6 flex space-x-8">
                  <Link
                    href={"/admin/orders" as any}
                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Orders
                  </Link>
                  <Link
                    href={"/admin/kyc" as any}
                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    KYC
                  </Link>
                  <Link
                    href={"/admin/products" as any}
                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Products
                  </Link>
                </div>
              </div>
              <div className="ml-6 flex items-center">
                <div className="ml-3 relative">
                  <div className="text-sm text-gray-700">
                    Welcome, {user[0].name || user[0].email || 'Admin'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          {children}
        </main>
      </div>
    );
  } catch (error) {
    console.error("Auth error:", error);
    redirect('/admin/login' as any);
  }
}
