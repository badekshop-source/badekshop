// src/app/(admin)/admin/layout.tsx
import { db } from "@/lib/db";
import { profiles, orders } from "@/lib/db/schema";
import { eq, inArray, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  // Skip auth check for login page by checking cookies in a different way
  const isLoginPage = cookie.includes("better-auth.session_token") === false;

  if (!isLoginPage) {
    try {
      const session = await auth.api.getSession({ headers: headersList });

      if (!session) {
        redirect("/admin/login" as any);
      }

      // Find user in profiles table by email
      const user = await db
        .select()
        .from(profiles)
        .where(eq(profiles.email, session.user.email))
        .limit(1);

      if (!user.length || user[0].role !== "admin") {
        redirect("/" as any);
      }

      const [pendingKYCResult, pendingOrdersResult] = await Promise.all([
        db.select({ count: count() }).from(orders).where(inArray(orders.kycStatus, ["pending", "retry_1", "retry_2", "under_review"])),
        db.select({ count: count() }).from(orders).where(inArray(orders.orderStatus, ["pending", "paid"])),
      ]);

      const totalPending = (pendingKYCResult[0]?.count ?? 0) + (pendingOrdersResult[0]?.count ?? 0);
      const userName = user[0].name || "Admin";
      const userEmail = user[0].email || "";

      return (
        <div className="min-h-screen bg-gray-50 flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <AdminSidebar pendingCount={totalPending} />
          </div>

          {/* Main Area */}
          <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
            <AdminHeader pendingCount={totalPending} userName={userName} userEmail={userEmail} />
            <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Auth error:", error);
      redirect("/admin/login" as any);
    }
  }

  // Login page - no sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
