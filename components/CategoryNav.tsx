  "use client";

import { Category } from "@/lib/types";

type CategoryNavProps = {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export default function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  if (categories.length === 0) return null;

  return (
    <div className="sticky top-[65px] z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto no-scrollbar px-4 py-3">
        {categories.map((cat) => {
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={[
                "flex-shrink-0 rounded-pill px-4 py-2 text-[13.5px] font-medium transition-colors whitespace-nowrap border",
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-ink-soft border-border hover:border-primary/40",
              ].join(" ")}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}