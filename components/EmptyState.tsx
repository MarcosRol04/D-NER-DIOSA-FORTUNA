export default function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-border px-6 py-14 text-center">
      <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-[13px] text-ink-soft">{subtitle}</p>}
    </div>
  );
}
