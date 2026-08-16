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
      className="flex gap-3.5 rounded-[18px] border border-border bg-surface p-3.5 text-left shadow-card transition-colors active:bg-primary-tint/40 cursor-pointer"
    >
      <div className="relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-[14px] bg-background">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-soft text-[10.5px]">
            fără foto
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-white">
              Epuizat
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-[15.5px] font-semibold leading-snug truncate text-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-[12.5px] leading-snug text-ink-soft line-clamp-2">
            {product.description}
          </p>
        )}
        {product.ingredients && (
          <p className="mt-1 text-[11px] leading-snug text-ink-soft/70 line-clamp-1">
            {product.ingredients}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-display text-[16px] font-semibold text-primary">
            {formatLei(product.price)}
          </span>

          <button
            disabled={!product.available}
            onClick={handleAddClick}
            className={[
              "flex items-center gap-1 rounded-pill px-3.5 py-1.5 text-[12.5px] font-semibold transition-all active:scale-95",
              product.available
                ? justAdded
                  ? "bg-success text-white"
                  : "bg-primary text-white hover:bg-primary-dark"
                : "bg-border text-ink-soft cursor-not-allowed",
            ].join(" ")}
          >
            {!product.available ? (
              "Epuizat"
            ) : justAdded ? (
              "Adăugat ✓"
            ) : hasOptions ? (
              "Alege"
            ) : (
              <>
                <span className="text-[14px] leading-none">+</span> Adaugă
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}