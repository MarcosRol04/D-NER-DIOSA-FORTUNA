import { createClient } from "@/lib/supabase/server";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("subcategories").select("*").order("display_order"),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[22px] font-semibold mb-5">CATEGORII</h1>
      <CategoriesManager
        initialCategories={categories ?? []}
        initialSubcategories={subcategories ?? []}
      />
    </div>
  );
}
