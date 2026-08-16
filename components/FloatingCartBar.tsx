"use client";

import { formatLei } from "@/lib/format";

type FloatingCartBarProps = {
  count: number;
  total: number;
  onOpen: () => void;
};

export default function FloatingCartBar({ count, total, onOpen }: FloatingCartBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onOpen}
          className="flex w-full items-center justify-between rounded-pill bg-primary px-5 py-3.5 text-white shadow-float transition-transform active:scale-[0.98] hover:bg-primary-dark animate-float-up"
        >
          <span className="flex items-center gap-2 text-[14.5px] font-semibold">
            <span aria-hidden>🛒</span>
            Coșul tău · {count}
          </span>
          <span className="font-display text-[15.5px] font-semibold">{formatLei(total)}</span>
        </button>
      </div>
    </div>
  );
}