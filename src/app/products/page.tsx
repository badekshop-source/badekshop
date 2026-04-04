// src/app/products/page.tsx
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { WhatsAppWidget } from '@/components/landing/WhatsAppWidget';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Product = InferSelectModel<typeof products>;

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ category?: string }> 
}) {
  const params = await searchParams;
  const category = params.category;

  if (!db) {
    return (
      <>
        <LandingHeader />
        <div className="container mx-auto px-4 py-8 min-h-[60vh]">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Products</h1>
          <p className="text-red-500">Database not connected. Please check your environment variables.</p>
        </div>
        <LandingFooter />
      </>
    );
  }
   
  let productsList: Product[] = [];
  if (category) {
    productsList = await db.select().from(products).where(eq(products.category, category)).orderBy(asc(products.price));
  } else {
    productsList = await db.select().from(products).orderBy(asc(products.price));
  }

  const categories = [
    { key: 'all', label: 'All Products' },
    { key: 'esim', label: 'eSIM' },
    { key: 'sim_card', label: 'Physical SIM' },
  ];

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category === 'esim' ? 'eSIM Plans' : category === 'sim_card' ? 'Physical SIM Plans' : 'All Products'}
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Choose the perfect connectivity solution for your Bali adventure. All products require activation and pickup at our Ngurah Rai Airport outlet.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={cat.key === 'all' ? '/products' : `/products?category=${cat.key}`}
                className={cn(
                  "px-6 py-3 rounded-full font-semibold transition-all duration-300",
                  (cat.key === 'all' && !category) || cat.key === category
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Products Grid */}
          {productsList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsList.map((product) => {
                const discountPct = product.discountPercentage ?? 0;
                const hasActiveDiscount = discountPct > 0 &&
                  (!product.discountStart || new Date(product.discountStart) <= new Date()) &&
                  (!product.discountEnd || new Date(product.discountEnd) >= new Date());
                
                const discountAmount = hasActiveDiscount ? Math.round(product.price * (discountPct / 100)) : 0;
                const discountedPrice = product.price - discountAmount;

                return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 flex flex-col relative"
                >
                  {/* Discount Badge */}
                  {hasActiveDiscount && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ring-2 ring-white">
                        {discountPct}% OFF
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className={cn("mb-4", hasActiveDiscount && "pt-2")}>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                      product.category === 'esim'
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    )}>
                      {product.category === 'esim' ? 'eSIM' : 'Physical SIM'}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
                  
                  {/* Description */}
                  {product.description && (
                    <ul className="text-gray-600 mb-4 space-y-1 text-sm">
                      {product.description.split('\n').map((line, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{line.replace(/^- /, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Price */}
                  <div className="mb-4">
                    {hasActiveDiscount && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm line-through text-gray-400">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(product.price)}
                        </span>
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          Save {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discountAmount)}
                        </span>
                      </div>
                    )}
                    <span className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(hasActiveDiscount ? discountedPrice : product.price)}
                    </span>
                  </div>
                  
                  {/* Tags */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    {product.duration && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                        {product.duration} days
                      </span>
                    )}
                    {product.size && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                        {product.size} SIM
                      </span>
                    )}
                    {product.isActive && (
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                        Available
                      </span>
                    )}
                  </div>
                  
                  {/* CTA Button */}
                  <Link
                    href={`/checkout?product=${product.id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 text-center font-semibold mt-auto"
                  >
                    Buy Now
                  </Link>
                </div>
              );})}
            </div>
          )}
        </div>
      </main>
      <LandingFooter />
      <WhatsAppWidget />
    </>
  );
}
