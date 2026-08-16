import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductsTable from "@/components/admin/ProductsTable";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("display_order"),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[22px] font-semibold">PRODUSE</h1>
        <Link
          href="/admin/produse/nou"
          className="rounded-pill bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white"
        >
          + Adaugă produs
        </Link>
      </div>

      <div className="mt-5">
        <ProductsTable
          initialProducts={products ?? []}
          categories={categories ?? []}
        />
      </div>
    </div>
  );
}
