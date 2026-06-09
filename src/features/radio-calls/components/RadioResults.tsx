"use client";

import { cn } from "@/shared/lib/cn";
import type { RadioScenario } from "@/content/model/radio";
import type { RadioResult } from "@/features/radio-calls/model/types";

interface RadioResultsProps {
  scenario: RadioScenario;
  result: RadioResult;
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
}

export function RadioResults({
  scenario,
  result,
  onPlayAgain,
  onBackToDashboard,
}: RadioResultsProps) {
  const feedback =
    result.percentage >= 90
      ? "Sharp — IPC examiner approved."
      : result.percentage >= 70
        ? "Solid. Review the misses below."
        : "Below pass standard — walk through the explanations and try again.";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--ifr-text-muted)]">
          {scenario.title}
        </p>
        <div className="my-3 text-5xl font-bold text-[var(--ifr-text)]">
          {result.percentage}%
        </div>
        <p className="text-sm text-[var(--ifr-text-muted)]">
          {result.correctAnswers} of {result.totalQuestions} calls correct
        </p>
        <p className="mt-2 text-base font-medium text-[var(--ifr-text)]">{feedback}</p>
      </div>

      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--ifr-text-muted)]">
          Per-call breakdown
        </h3>
        <ul className="space-y-2 text-sm">
          {result.perLeg.map((entry, idx) => (
            <li
              key={entry.legId}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                entry.isCorrect
                  ? "border-[var(--ifr-success)]/30 bg-[var(--ifr-success)]/5"
                  : "border-[var(--ifr-danger)]/30 bg-[var(--ifr-danger)]/5",
              )}
            >
              <span className="text-[var(--ifr-text)]">
                {entry.kind === "readback" ? "Readback" : "Call"} {idx + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  entry.isCorrect ? "text-[var(--ifr-success)]" : "text-[var(--ifr-danger)]",
                )}
              >
                {entry.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] py-3 font-medium text-[var(--ifr-text)] transition-colors hover:bg-[var(--ifr-surface-muted)]"
        >
          Choose Another
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-xl bg-[var(--ifr-cta-bg)] py-3 font-medium text-white transition-colors hover:bg-[var(--ifr-cta-bg-hover)]"
        >
          Try Again
        </button>
      </div>

      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-4 text-xs leading-relaxed text-[var(--ifr-text-muted)]">
        <p className="mb-1 font-semibold uppercase tracking-wider">Reminder</p>
        <p>
          These scenarios are study material drawn from AIP Australia and MATS — they
          are not a substitute for current AIP, ERSA, NOTAMs, or your operator&apos;s
          standard operating procedures. Always verify against the current source
          before flight.
        </p>
      </div>
    </div>
  );
}
