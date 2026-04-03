// src/app/(admin)/admin/kyc/page.tsx
import { db } from '@/lib/db';
import { orders, kycDocuments, profiles } from '@/lib/db/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminKycPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  // Check if database is available
  if (!db) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Database Connection Error</p>
          <p>Please set up your database connection and environment variables.</p>
        </div>
      </div>
    );
  }

  const { search, status } = await searchParams;

  // Build query with filters
  let query = db
    .select({
      order: orders,
      kycDoc: kycDocuments,
      customer: profiles,
    })
    .from(orders)
    .leftJoin(kycDocuments, eq(orders.id, kycDocuments.orderId))
    .leftJoin(profiles, eq(orders.userId, profiles.id))
    .where(and(
      sql`${orders.kycStatus} != 'pending'`,
      sql`${orders.kycStatus} != 'approved'`
    ))
    .orderBy(desc(orders.updatedAt));

  if (search) {
    query = query.where(ilike(orders.orderNumber, `%${search}%`));
  }

  if (status) {
    query = query.where(eq(orders.kycStatus, status));
  }

  type KYCWithRelations = {
    order: typeof orders.$inferSelect;
    kycDoc: typeof kycDocuments.$inferSelect | null;
    customer: typeof profiles.$inferSelect | null;
  };

  const kycList: KYCWithRelations[] = await query;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    auto_approved: 'bg-green-100 text-green-800',
    retry_1: 'bg-yellow-100 text-yellow-800',
    retry_2: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passport
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IMEI
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kycList.map(({ order, kycDoc, customer }) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.fullName}<br />
                  <span className="text-xs text-gray-400">{order.customerEmail}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.passportUrl ? (
                    <a 
                      href={order.passportUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    'Not uploaded'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.imeiNumber || 'Not provided'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.kycStatus ?? ''] || 'bg-gray-100 text-gray-800'}`}>
                    {(order.kycStatus ?? '').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.kycAttempts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/admin/kyc/${order.id}` as any} 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {order.kycStatus === 'under_review' ? 'Review' : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}