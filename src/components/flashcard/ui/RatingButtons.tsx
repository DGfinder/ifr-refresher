"use client";

import type { DrillRating } from "@/types/drill";

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
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-4 py-4 text-sm font-semibold text-amber-600 transition-all hover:border-amber-500/70 hover:bg-amber-500/20 active:scale-95 disabled:opacity-50 dark:text-amber-400"
      >
        <span className="text-lg">↩</span>
        <span>Unsure</span>
        <kbd className="hidden rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-mono sm:block">←</kbd>
      </button>

      <button
        onClick={() => onRate("got-it")}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-sm font-semibold text-emerald-600 transition-all hover:border-emerald-500/70 hover:bg-emerald-500/20 active:scale-95 disabled:opacity-50 dark:text-emerald-400"
      >
        <span>Got it</span>
        <span className="text-lg">✓</span>
        <kbd className="hidden rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-mono sm:block">→</kbd>
      </button>
    </div>
  );
}
