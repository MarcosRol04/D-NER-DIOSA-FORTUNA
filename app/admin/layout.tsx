import Link from "next/link";
import SignOutButton from "@/components/admin/SignOutButton";

const NAV_ITEMS = [
  { href: "/admin", label: "Panou" },
  { href: "/admin/produse", label: "Produse" },
  { href: "/admin/categorii", label: "Categorii" },
  { href: "/admin/setari", label: "Setări restaurant" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="border-b border-border bg-ink text-white md:w-56 md:flex-shrink-0 md:border-b-0 md:border-r">
        <div className="px-5 py-4">
          <p className="font-display text-[15px] font-semibold leading-tight">
            DÖNER DIOSA
            <br />
            FORTUNA
          </p>
          <p className="mt-0.5 text-[11px] text-white/50">Panou de administrare</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 rounded-[10px] px-3 py-2 text-[13.5px] text-white/80 hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-3 pb-4 md:block">
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="md:hidden mb-4">
          <SignOutButton />
        </div>
        {children}
      </main>
    </div>
  );
}
