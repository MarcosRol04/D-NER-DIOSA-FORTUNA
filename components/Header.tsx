"use client";

type HeaderProps = {
  name: string;
  logoUrl: string | null;
  cartCount: number;
  onOpenCart: () => void;
};

export default function Header({ name, logoUrl, cartCount, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={name}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white font-display text-sm">
              DF
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-[18px] font-semibold leading-tight tracking-tight truncate">
              {name}
            </h1>
            <span className="brand-rule mt-1" />
          </div>
        </div>

        <button
          onClick={onOpenCart}
          aria-label="Deschide coșul"
          className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform active:scale-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-ink animate-pop">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}