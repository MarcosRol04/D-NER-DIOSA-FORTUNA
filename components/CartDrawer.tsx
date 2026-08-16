"use client";

import { CartItem } from "@/lib/types";
import { formatLei } from "@/lib/format";
import { cartTotal } from "@/lib/cart";
import EmptyState from "./EmptyState";

type CartDrawerProps = {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onClear: () => void;
  onShowWaiter: () => void;
};

export default function CartDrawer({
  items,
  onClose,
  onUpdateQuantity,
  onClear,
  onShowWaiter,
}: CartDrawerProps) {
  const total = cartTotal(items);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="animate-float-up flex w-full max-w-2xl flex-col rounded-t-[24px] bg-background max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-[18px] font-semibold">COȘUL MEU</h2>
          <button
            onClick={onClose}
            aria-label="Închide"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <EmptyState
              title="COȘUL TĂU ESTE GOL."
              subtitle="Adaugă produse din meniu pentru a le vedea aici."
            />
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.line_id}
                  className="flex items-start justify-between gap-3 rounded-card border border-border bg-surface p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[14.5px] font-semibold">
                      {item.name}
                    </p>
                    {item.selected_options.length > 0 && (
                      <p className="mt-0.5 text-[12px] text-ink-soft">
                        {item.selected_options.map((o) => o.choice_label).join(", ")}
                      </p>
                    )}
                    <p className="mt-1 text-[13px] font-medium text-primary">
                      {formatLei(item.unit_price)}
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3 rounded-pill border border-border px-3 py-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.line_id, item.quantity - 1)}
                      aria-label="Scade cantitatea"
                      className="w-4 text-base font-semibold"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-[13.5px] font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.line_id, item.quantity + 1)}
                      aria-label="Crește cantitatea"
                      className="w-4 text-base font-semibold"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] uppercase tracking-wide text-ink-soft">
                Total orientativ
              </span>
              <span className="font-display text-[20px] font-semibold text-primary">
                {formatLei(total)}
              </span>
            </div>

            <p className="text-center text-[11.5px] leading-snug text-ink-soft">
              ACEASTĂ SELECȚIE NU REPREZINTĂ O COMANDĂ.
              <br />
              ARATĂ SELECȚIA CHELNERULUI PENTRU A PLASA COMANDA.
            </p>

            <button
              onClick={onShowWaiter}
              className="w-full rounded-pill bg-primary px-5 py-3.5 text-[15px] font-semibold text-white active:scale-[0.98] transition-transform"
            >
              ARATĂ CHELNERULUI
            </button>
            <button
              onClick={onClear}
              className="w-full rounded-pill border border-border px-5 py-3 text-[13.5px] font-medium text-ink-soft active:scale-[0.98] transition-transform"
            >
              GOLEȘTE COȘUL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
