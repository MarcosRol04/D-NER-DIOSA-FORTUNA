"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Category, Product } from "@/lib/types";
import { formatLei } from "@/lib/format";

type ProductsTableProps = {
  initialProducts: Product[];
  categories: Category[];
};

export default function ProductsTable({ initialProducts, categories }: ProductsTableProps) {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(
    initialProducts.map((p) => ({ ...p, price: Number(p.price) }))
  );

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  async function toggleAvailable(product: Product) {
    const next = !product.available;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, available: next } : p))
    );
    await supabase.from("products").update({ available: next }).eq("id", product.id);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Ștergi definitiv „${product.name}”?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    await supabase.from("products").delete().eq("id", product.id);
  }

  if (products.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border px-5 py-10 text-center text-[13.5px] text-ink-soft">
        Nu există produse încă. Adaugă primul produs din meniu.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-background p-3.5"
        >
          <div className="min-w-0 flex-1">
            <p className="font-display text-[14.5px] font-semibold truncate">
              {product.name}
            </p>
            <p className="text-[12.5px] text-ink-soft">
              {categoryName(product.category_id)} · {formatLei(product.price)} ·{" "}
              <span className={product.available ? "text-success" : "text-danger"}>
                {product.available ? "Disponibil" : "Epuizat"}
              </span>
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href={`/admin/produse/${product.id}`}
              className="rounded-pill border border-border px-3.5 py-1.5 text-[12.5px] font-medium"
            >
              Editare
            </Link>
            <button
              onClick={() => toggleAvailable(product)}
              className="rounded-pill border border-border px-3.5 py-1.5 text-[12.5px] font-medium"
            >
              {product.available ? "Epuizat" : "Disponibil"}
            </button>
            <button
              onClick={() => handleDelete(product)}
              className="rounded-pill border border-danger/30 px-3.5 py-1.5 text-[12.5px] font-medium text-danger"
            >
              Șterge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
