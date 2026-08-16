import { createClient } from "@/lib/supabase/server";
import MenuApp from "@/components/MenuApp";
import { Product, ProductOptionGroup } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();

  const [
    { data: categories },
    { data: subcategories },
    { data: products },
    { data: settings },
    { data: optionGroups },
    { data: optionChoices },
  ] = await Promise.all([
    supabase.from("categories").select("*").eq("active", true).order("display_order"),
    supabase.from("subcategories").select("*").eq("active", true).order("display_order"),
    supabase.from("products").select("*").order("display_order"),
    supabase.from("restaurant_settings").select("*").limit(1).maybeSingle(),
    supabase.from("product_option_groups").select("*").order("display_order"),
    supabase.from("product_option_choices").select("*").order("display_order"),
  ]);

  const groupsByProduct: Record<string, ProductOptionGroup[]> = {};
  for (const g of optionGroups ?? []) {
    const choices = (optionChoices ?? []).filter((c: any) => c.group_id === g.id);
    const group: ProductOptionGroup = {
      id: g.id,
      name: g.name,
      type: g.type,
      required: g.required,
      display_order: g.display_order,
      choices: choices.map((c: any) => ({
        id: c.id,
        label: c.label,
        price_delta: Number(c.price_delta),
        display_order: c.display_order,
      })),
    };
    if (!groupsByProduct[g.product_id]) groupsByProduct[g.product_id] = [];
    groupsByProduct[g.product_id].push(group);
  }

  const productsWithOptions: Product[] = (products ?? []).map((p: any) => ({
    ...p,
    price: Number(p.price),
    option_groups: groupsByProduct[p.id] ?? [],
  }));

  return (
    <MenuApp
      categories={categories ?? []}
      subcategories={subcategories ?? []}
      products={productsWithOptions}
      settings={settings ?? null}
    />
  );
}
