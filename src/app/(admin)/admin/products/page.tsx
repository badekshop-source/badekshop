import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { ProductsTable } from "./products-table";

export default async function AdminProductsPage() {
  if (!db) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Database Connection Error</p>
        <p className="text-sm mt-1">Please check your environment variables.</p>
      </div>
    );
  }

  const productsList = await db
    .select()
    .from(products)
    .orderBy(products.name);

  return <ProductsTable productsList={productsList} />;
}
