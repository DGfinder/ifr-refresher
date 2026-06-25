"use client";

import type { DrillRating } from "@/features/drill";

interface RatingButtonsProps {
  onRate: (rating: DrillRating) => void;
  disabled?: boolean;
}

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="flex w-full gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={() => onRate("unsure")}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ifr-warning)]/40 bg-[var(--ifr-warning-soft)] px-4 py-4 text-sm font-semibold text-[var(--ifr-warning)] transition-all hover:border-[var(--ifr-warning)]/70 hover:bg-[var(--ifr-warning)]/20 active:scale-95 disabled:opacity-50"
      >
        <span className="text-lg">↩</span>
        <span>Unsure</span>
        <kbd className="hidden rounded bg-[var(--ifr-warning)]/20 px-1.5 py-0.5 text-xs font-mono sm:block">←</kbd>
      </button>

      <button
        onClick={() => onRate("got-it")}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--ifr-success)]/40 bg-[var(--ifr-success-soft)] px-4 py-4 text-sm font-semibold text-[var(--ifr-success)] transition-all hover:border-[var(--ifr-success)]/70 hover:bg-[var(--ifr-success)]/20 active:scale-95 disabled:opacity-50"
      >
        <span>Got it</span>
        <span className="text-lg">✓</span>
        <kbd className="hidden rounded bg-[var(--ifr-success)]/20 px-1.5 py-0.5 text-xs font-mono sm:block">→</kbd>
      </button>
    </div>
  );
}
