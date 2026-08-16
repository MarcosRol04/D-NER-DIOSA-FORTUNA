"use client";

import { Product, Subcategory } from "@/lib/types";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";

type ProductListProps = {
  products: Product[];
  subcategories: Subcategory[];
  onAdd: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
};

export default function ProductList({
  products,
  subcategories,
  onAdd,
  onOpenDetail,
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="NU EXISTĂ PRODUSE ÎN ACEASTĂ CATEGORIE."
        subtitle="Reveniți în curând — meniul este actualizat de restaurant."
      />
    );
  }

  const withoutSubcategory = products.filter((p) => !p.subcategory_id);
  const groups = subcategories
    .map((sub) => ({
      sub,
      items: products.filter((p) => p.subcategory_id === sub.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-7">
      {withoutSubcategory.length > 0 && (
        <div className="space-y-3">
          {withoutSubcategory.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      )}

      {groups.map(({ sub, items }) => (
        <div key={sub.id} className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
            {sub.name}
          </h2>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      ))}
    </div>
  );
}