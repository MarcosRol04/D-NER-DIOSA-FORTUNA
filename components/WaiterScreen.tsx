"use client";

import { CartItem } from "@/lib/types";
import { formatLei } from "@/lib/format";
import { cartTotal } from "@/lib/cart";

type WaiterScreenProps = {
  items: CartItem[];
  onClose: () => void;
};

export default function WaiterScreen({ items, onClose }: WaiterScreenProps) {
  const total = cartTotal(items);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="font-display text-[18px] font-semibold">SELECȚIA MEA</h1>
        <button
          onClick={onClose}
          aria-label="Închide"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <ul className="divide-y divide-white/10">
          {items.map((item) => (
            <li key={item.line_id} className="flex items-start justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-display text-[17px] font-semibold leading-snug">
                  {item.quantity} × {item.name}
                </p>
                {item.selected_options.length > 0 && (
                  <p className="mt-1 text-[13px] text-white/60">
                    {item.selected_options.map((o) => o.choice_label).join(", ")}
                  </p>
                )}
              </div>
              <span className="flex-shrink-0 font-display text-[16px] font-semibold text-primary">
                {formatLei(item.unit_price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pb-8 pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] uppercase tracking-wide text-white/60">
            Total orientativ
          </span>
          <span className="font-display text-[26px] font-semibold text-primary">
            {formatLei(total)}
          </span>
        </div>

        <div className="rounded-card bg-white/5 px-4 py-4 text-center">
          <p className="font-display text-[16px] font-semibold">
            ARATĂ ACEASTĂ ECRAN CHELNERULUI.
          </p>
          <p className="mt-1 text-[12.5px] text-white/60">
            Comanda va fi preluată direct de către chelner.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-pill border border-white/20 px-5 py-3 text-[13.5px] font-medium text-white/80"
        >
          Înapoi la coș
        </button>
      </div>
    </div>
  );
}
