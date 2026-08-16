"use client";

import { useMemo, useState } from "react";
import { Product, SelectedOption } from "@/lib/types";
import { formatLei } from "@/lib/format";

type ProductOptionsSheetProps = {
  product: Product;
  onClose: () => void;
  onConfirm: (selected: SelectedOption[], quantity: number) => void;
};

export default function ProductOptionsSheet({
  product,
  onClose,
  onConfirm,
}: ProductOptionsSheetProps) {
  const groups = product.option_groups ?? [];

  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const g of groups) {
      if (g.type === "single" && g.required && g.choices[0]) {
        initial[g.id] = [g.choices[0].id];
      } else {
        initial[g.id] = [];
      }
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);

  function toggleChoice(groupId: string, choiceId: string, type: "single" | "multiple") {
    setSelections((prev) => {
      const current = prev[groupId] ?? [];
      if (type === "single") {
        return { ...prev, [groupId]: [choiceId] };
      }
      const exists = current.includes(choiceId);
      return {
        ...prev,
        [groupId]: exists
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId],
      };
    });
  }

  const selectedOptions: SelectedOption[] = useMemo(() => {
    const result: SelectedOption[] = [];
    for (const g of groups) {
      for (const choiceId of selections[g.id] ?? []) {
        const choice = g.choices.find((c) => c.id === choiceId);
        if (choice) {
          result.push({
            group_id: g.id,
            group_name: g.name,
            choice_id: choice.id,
            choice_label: choice.label,
            price_delta: choice.price_delta,
          });
        }
      }
    }
    return result;
  }, [groups, selections]);

  const unitPrice =
    product.price + selectedOptions.reduce((sum, o) => sum + o.price_delta, 0);

  const canConfirm =
    product.available &&
    groups.filter((g) => g.required).every((g) => (selections[g.id] ?? []).length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="animate-float-up w-full max-w-2xl rounded-t-[24px] bg-background max-h-[88vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
          <h2 className="font-display text-[17px] font-semibold truncate pr-4">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            aria-label="Închide"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface text-ink"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-48 w-full rounded-[16px] object-cover"
            />
          )}

          <div className="flex items-baseline justify-between">
            <span className="font-display text-[18px] font-semibold text-primary">
              {formatLei(product.price)}
            </span>
            {!product.available && (
              <span className="text-[12px] font-semibold uppercase tracking-wide text-danger">
                Epuizat
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-[13.5px] text-ink-soft">{product.description}</p>
          )}

          {product.ingredients && (
            <div>
              <h3 className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
                Ingrediente
              </h3>
              <p className="text-[13.5px] leading-relaxed text-ink">{product.ingredients}</p>
            </div>
          )}

          {groups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-[14px] font-semibold">{group.name}</h3>
                {group.required && (
                  <span className="text-[11px] text-primary font-medium">obligatoriu</span>
                )}
              </div>
              <div className="space-y-2">
                {group.choices.map((choice) => {
                  const checked = (selections[group.id] ?? []).includes(choice.id);
                  return (
                    <label
                      key={choice.id}
                      className={[
                        "flex items-center justify-between rounded-[12px] border px-3.5 py-2.5 text-[14px] cursor-pointer",
                        checked ? "border-primary bg-orange-50" : "border-border",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type={group.type === "single" ? "radio" : "checkbox"}
                          name={group.id}
                          checked={checked}
                          onChange={() => toggleChoice(group.id, choice.id, group.type)}
                          className="h-4 w-4 accent-[--primary-color]"
                        />
                        {choice.label}
                      </span>
                      {choice.price_delta !== 0 && (
                        <span className="text-ink-soft text-[13px]">
                          +{formatLei(choice.price_delta)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="mb-2 text-[14px] font-semibold">Cantitate</h3>
            <div className="flex w-fit items-center gap-4 rounded-pill border border-border px-4 py-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-lg font-semibold text-ink w-5"
                aria-label="Scade cantitatea"
              >
                −
              </button>
              <span className="w-4 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="text-lg font-semibold text-ink w-5"
                aria-label="Crește cantitatea"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background px-5 py-4">
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm(selectedOptions, quantity)}
            className={[
              "flex w-full items-center justify-between rounded-pill px-5 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]",
              canConfirm ? "bg-primary" : "bg-border text-ink-soft",
            ].join(" ")}
          >
            <span>ADAUGĂ ÎN COȘ</span>
            <span>{formatLei(unitPrice * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}