"use client";

import type { SessionResults } from "./FlashcardSession";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { Button } from "@/shared/ui/button";

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
        <h2 className="text-2xl font-bold text-[var(--ifr-text)]">
          {pct >= 90 ? "Outstanding session! 🌟" : pct >= 70 ? "Good run — keep going. 🎯" : "Session complete — review your weak spots."}
        </h2>
        <p className="mt-1 text-sm text-[var(--ifr-text-muted)]">
          {gotIt} of {total} card{total !== 1 ? "s" : ""} confirmed solid
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--ifr-text)]">{total}</div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Reviewed</div>
        </div>
        <div className="rounded-xl border border-[var(--ifr-success)]/30 bg-[var(--ifr-success-soft)] p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--ifr-success)]">
            {gotIt}
          </div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Got It</div>
        </div>
        <div className="rounded-xl border border-[var(--ifr-warning)]/30 bg-[var(--ifr-warning-soft)] p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--ifr-warning)]">
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
          <ProgressBar
            value={pct}
            className="h-2"
            indicatorClassName="duration-700"
            aria-label="Flashcard accuracy"
          />
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3">
        {weakCount > 0 && (
          <Button
            onClick={onStudyWeak}
            size="lg"
            className="w-full border-2 border-[var(--ifr-warning)]/40 bg-[var(--ifr-warning-soft)] text-[var(--ifr-warning)] hover:border-[var(--ifr-warning)]/70 hover:bg-[var(--ifr-warning)]/20 active:scale-[0.98]"
          >
            Study Weak Cards — {weakCount} remaining
          </Button>
        )}
        <Button
          onClick={onNewSession}
          size="lg"
          className="w-full active:scale-[0.98]"
        >
          Start Another Session
        </Button>
        <Button
          onClick={onBackToMenu}
          variant="secondary"
          size="lg"
          className="w-full active:scale-[0.98]"
        >
          Back to Dashboard
        </Button>
      </div>

      <p className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] px-3 py-2 text-xs leading-relaxed text-[var(--ifr-text-muted)]">
        <span className="font-semibold uppercase tracking-wider">Reminder · </span>
        Study aid only. Verify against current CASA, AIP, ERSA, aircraft manuals, and operator
        procedures before flight.
      </p>
    </div>
  );
}
