"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { formatLei } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
};

export default function ProductCard({ product, onAdd, onOpenDetail }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const hasOptions = (product.option_groups?.length ?? 0) > 0;

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAdd(product);
    if (!hasOptions) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 700);
    }
  }

  return (
    <div
      onClick={() => onOpenDetail(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpenDetail(product);
      }}
      className="flex gap-3 rounded-card border border-border bg-surface p-3 text-left active:bg-white cursor-pointer"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[14px] bg-white">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-soft text-xs">
            fără foto
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white">
              Epuizat
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-[15px] font-semibold leading-snug truncate">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-0.5 text-[13px] leading-snug text-ink-soft line-clamp-2">
            {product.description}
          </p>
        )}
        {product.ingredients && (
          <p className="mt-1 text-[11.5px] leading-snug text-ink-soft/80 line-clamp-1 italic">
            {product.ingredients}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold text-primary">
            {formatLei(product.price)}
          </span>

          <button
            disabled={!product.available}
            onClick={handleAddClick}
            className={[
              "rounded-pill px-3.5 py-1.5 text-[12.5px] font-semibold transition-all active:scale-95",
              product.available
                ? justAdded
                  ? "bg-success text-white"
                  : "bg-ink text-white"
                : "bg-border text-ink-soft cursor-not-allowed",
            ].join(" ")}
          >
            {!product.available
              ? "Epuizat"
              : justAdded
              ? "Adăugat ✓"
              : hasOptions
              ? "Alege"
              : "Adaugă"}
          </button>
        </div>
      </div>
    </div>
  );
}