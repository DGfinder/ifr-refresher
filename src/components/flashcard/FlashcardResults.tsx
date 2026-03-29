"use client";

import type { SessionResults } from "./FlashcardSession";

interface FlashcardResultsProps {
  results: SessionResults;
  weakCount: number;
  onStudyWeak: () => void;
  onNewSession: () => void;
  onBackToMenu: () => void;
}

export function FlashcardResults({
  results,
  weakCount,
  onStudyWeak,
  onNewSession,
  onBackToMenu,
}: FlashcardResultsProps) {
  const { total, gotIt, unsure } = results;
  const pct = total > 0 ? Math.round((gotIt / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-sm space-y-6 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--ifr-text)]">Session Complete</h2>
        <p className="mt-1 text-sm text-[var(--ifr-text-muted)]">Here&apos;s how you did</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--ifr-text)]">{total}</div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Reviewed</div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {gotIt}
          </div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Got It</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {unsure}
          </div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Unsure</div>
        </div>
      </div>

      {/* Accuracy bar */}
      {total > 0 && (
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-[var(--ifr-text)]">Accuracy</span>
            <span className="font-bold text-[var(--ifr-accent)]">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--ifr-border)]">
            <div
              className="h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3">
        {weakCount > 0 && (
          <button
            onClick={onStudyWeak}
            className="w-full rounded-xl border-2 border-amber-500/40 bg-amber-500/10 py-4 text-sm font-semibold text-amber-600 transition-all hover:border-amber-500/70 hover:bg-amber-500/20 active:scale-[0.98] dark:text-amber-400"
          >
            Study Weak Cards — {weakCount} remaining
          </button>
        )}
        <button
          onClick={onNewSession}
          className="w-full rounded-xl bg-[var(--ifr-accent)] py-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--ifr-accent)]/90 active:scale-[0.98] dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          New Session
        </button>
        <button
          onClick={onBackToMenu}
          className="w-full rounded-xl border border-[var(--ifr-border)] py-4 text-sm font-semibold text-[var(--ifr-text)] transition-all hover:bg-[var(--ifr-surface-muted)] active:scale-[0.98]"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
