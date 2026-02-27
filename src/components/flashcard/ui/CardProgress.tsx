"use client";

interface CardProgressProps {
  current: number;
  total: number;
}

export function CardProgress({ current, total }: CardProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--ifr-border)]">
        <div
          className="h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--ifr-text-muted)]">
        {current} / {total}
      </span>
    </div>
  );
}
