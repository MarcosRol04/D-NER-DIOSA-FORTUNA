import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [{ count: totalProducts }, { count: availableProducts }, { count: totalCategories }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("available", true),
      supabase.from("categories").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Produse", value: totalProducts ?? 0 },
    { label: "Categorii", value: totalCategories ?? 0 },
    { label: "Produse disponibile", value: availableProducts ?? 0 },
    {
      label: "Produse epuizate",
      value: (totalProducts ?? 0) - (availableProducts ?? 0),
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[22px] font-semibold">PANOU DE ADMINISTRARE</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-card border border-border bg-background p-4 shadow-card"
          >
            <p className="font-display text-[26px] font-semibold text-primary">
              {s.value}
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/produse/nou"
          className="rounded-pill bg-primary px-5 py-3 text-[14px] font-semibold text-white"
        >
          + Adaugă produs
        </Link>
        <Link
          href="/admin/categorii"
          className="rounded-pill border border-border bg-background px-5 py-3 text-[14px] font-medium"
        >
          Gestionează categorii
        </Link>
        <Link
          href="/admin/setari"
          className="rounded-pill border border-border bg-background px-5 py-3 text-[14px] font-medium"
        >
          Setări restaurant
        </Link>
      </div>
    </div>
  );
}
