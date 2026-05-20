"use client";

import { ProgressBar } from "@/shared/ui/ProgressBar";

interface CardProgressProps {
  current: number;
  total: number;
}

export function CardProgress({ current, total }: CardProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <ProgressBar value={pct} className="h-1.5 flex-1" aria-label="Card session progress" />
      <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--ifr-text-muted)]">
        {current} / {total}
      </span>
    </div>
  );
}
