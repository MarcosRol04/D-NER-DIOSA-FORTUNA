import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { ProductOptionGroup } from "@/lib/types";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [
    { data: product },
    { data: categories },
    { data: subcategories },
    { data: optionGroups },
    { data: optionChoices },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("subcategories").select("*").order("display_order"),
    supabase
      .from("product_option_groups")
      .select("*")
      .eq("product_id", params.id)
      .order("display_order"),
    supabase.from("product_option_choices").select("*").order("display_order"),
  ]);

  if (!product) notFound();

  const groups: ProductOptionGroup[] = (optionGroups ?? []).map((g: any) => ({
    id: g.id,
    name: g.name,
    type: g.type,
    required: g.required,
    display_order: g.display_order,
    choices: (optionChoices ?? [])
      .filter((c: any) => c.group_id === g.id)
      .map((c: any) => ({
        id: c.id,
        label: c.label,
        price_delta: Number(c.price_delta),
        display_order: c.display_order,
      })),
  }));

  return (
    <div>
      <h1 className="font-display text-[22px] font-semibold mb-5">EDITARE PRODUS</h1>
      <ProductForm
        categories={categories ?? []}
        subcategories={subcategories ?? []}
        product={{ ...product, price: Number(product.price), option_groups: groups }}
      />
    </div>
  );
}
