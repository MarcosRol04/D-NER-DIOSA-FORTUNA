import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("subcategories").select("*").order("display_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-[22px] font-semibold mb-5">+ ADAUGĂ PRODUS</h1>
      {(categories ?? []).length === 0 ? (
        <p className="text-[13.5px] text-ink-soft">
          Creează mai întâi cel puțin o categorie din secțiunea{" "}
          <span className="font-medium">Categorii</span>.
        </p>
      ) : (
        <ProductForm categories={categories ?? []} subcategories={subcategories ?? []} />
      )}
    </div>
  );
}
