// src/app/(admin)/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  // Redirect to orders page by default
  redirect('/admin/orders' as any);
}