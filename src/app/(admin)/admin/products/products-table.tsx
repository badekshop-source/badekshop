'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProductItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  duration: number | null;
  stock: number | null;
  isActive: boolean | null;
  badge: string | null;
  discountPercentage: number | null;
  discountStart: string | null;
  discountEnd: string | null;
}

interface ProductsTableProps {
  productsList: ProductItem[];
}

export function ProductsTable({ productsList }: ProductsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductItem[]>(productsList);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <DataTable
        headers={[
          { key: 'name', label: 'Product' },
          { key: 'category', label: 'Category' },
          { key: 'badge', label: 'Badge' },
          { key: 'price', label: 'Price' },
          { key: 'discount', label: 'Discount' },
          { key: 'duration', label: 'Duration' },
          { key: 'stock', label: 'Stock' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: '', className: 'text-right' },
        ]}
        rows={products.map((product) => {
          const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
          const discountEnd = product.discountEnd ? new Date(product.discountEnd) : null;
          const isActiveDiscount = hasDiscount && (!discountEnd || discountEnd >= new Date());
          
          const badgeColors: Record<string, string> = {
            popular: 'bg-orange-100 text-orange-700 border-orange-200',
            best_value: 'bg-green-100 text-green-700 border-green-200',
            new: 'bg-blue-100 text-blue-700 border-blue-200',
            limited: 'bg-purple-100 text-purple-700 border-purple-200',
          };

          const badgeLabels: Record<string, string> = {
            popular: 'Most Popular',
            best_value: 'Best Value',
            new: 'New Arrival',
            limited: 'Limited',
          };
          
          return {
          id: product.id,
          cells: {
            name: (
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-xs">{product.description || 'No description'}</p>
              </div>
            ),
            category: (
              <Badge variant="outline" className="capitalize">{product.category}</Badge>
            ),
            badge: product.badge ? (
              <Badge variant="outline" className={badgeColors[product.badge] || 'bg-gray-100 text-gray-700'}>
                {badgeLabels[product.badge] || product.badge}
              </Badge>
            ) : (
              <span className="text-gray-400">-</span>
            ),
            price: (
              <div>
                {hasDiscount && isActiveDiscount ? (
                  <>
                    <span className="font-medium text-green-600">
                      {formatCurrency(product.price * (1 - (product.discountPercentage ?? 0) / 100))}
                    </span>
                    <span className="text-xs text-gray-400 line-through ml-1">
                      {formatCurrency(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">{formatCurrency(product.price)}</span>
                )}
              </div>
            ),
            discount: hasDiscount ? (
              <Badge variant={isActiveDiscount ? "default" : "secondary"} className="text-xs">
                {product.discountPercentage}%
              </Badge>
            ) : (
              <span className="text-gray-400">-</span>
            ),
            duration: product.duration ? (
              <span className="text-gray-600">{product.duration} days</span>
            ) : (
              <span className="text-gray-400">-</span>
            ),
            stock: (
              <span className={(product.stock ?? 0) <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {product.stock ?? 0}
              </span>
            ),
            status: <StatusBadge status={product.isActive ? 'active' : 'inactive'} />,
            actions: (
              <div className="flex justify-end gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit` as any}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ),
          },
        };})}
        emptyMessage="No products found"
      />
    </div>
  );
}
