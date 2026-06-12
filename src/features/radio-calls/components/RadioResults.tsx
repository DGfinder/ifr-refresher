"use client";

import { Check, ChevronDown, X, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioScenario } from "@/content/model/radio";
import type {
  RadioAnswerMap,
  RadioResult,
} from "@/features/radio-calls/model/types";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";

interface RadioResultsProps {
  scenario: RadioScenario;
  result: RadioResult;
  answers: RadioAnswerMap;
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
}

function kindLabel(kind: "mcq" | "readback" | "spoken"): string {
  switch (kind) {
    case "mcq":
      return "Call";
    case "readback":
      return "Readback";
    case "spoken":
      return "Spoken call";
  }
}

export function RadioResults({
  scenario,
  result,
  answers,
  onPlayAgain,
  onBackToDashboard,
}: RadioResultsProps) {
  const feedback =
    result.percentage >= 90
      ? "Sharp — IPC examiner approved."
      : result.percentage >= 70
        ? "Solid. Review the misses below."
        : "Below pass standard — walk through the explanations and try again.";

  // Spoken legs that were wrong default to expanded so the learner sees
  // which elements they missed without an extra click. Everything else
  // collapses to keep the page short. Default-open state is computed
  // once per leg and passed to Radix Collapsible's `defaultOpen`.
  const defaultOpenFor = (legId: string, kind: string, isCorrect: boolean) =>
    kind === "spoken" && !isCorrect;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="p-6 text-center">
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
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--ifr-text-muted)]">
          Per-call breakdown
        </h3>
        <ul className="space-y-2 text-sm">
          {result.perLeg.map((entry, idx) => {
            const answer = answers[entry.questionId];
            const canExpand = entry.kind === "spoken" && answer?.kind === "spoken";
            const wrapperClass = cn(
              "rounded-lg border",
              entry.isCorrect
                ? "border-[var(--ifr-success)]/30 bg-[var(--ifr-success)]/5"
                : "border-[var(--ifr-danger)]/30 bg-[var(--ifr-danger)]/5",
            );
            const triggerClass = cn(
              "flex w-full items-center justify-between gap-2 px-3 py-2 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)] focus-visible:ring-inset",
              canExpand ? "cursor-pointer" : "cursor-default",
            );

            const labelAndStatus = (
              <>
                <span className="flex items-center gap-2 text-[var(--ifr-text)]">
                  {canExpand && (
                    <ChevronDown
                      size={14}
                      className="transition-transform [&[data-state=closed]]:rotate-[-90deg] group-data-[state=closed]:rotate-[-90deg]"
                    />
                  )}
                  <span>
                    {kindLabel(entry.kind)} {idx + 1}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    entry.isCorrect ? "text-[var(--ifr-success)]" : "text-[var(--ifr-danger)]",
                  )}
                >
                  {entry.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </>
            );

            if (!canExpand || answer?.kind !== "spoken") {
              return (
                <li key={entry.legId} className={wrapperClass}>
                  <div className={triggerClass}>{labelAndStatus}</div>
                </li>
              );
            }

            return (
              <li key={entry.legId} className={wrapperClass}>
                <Collapsible
                  defaultOpen={defaultOpenFor(entry.legId, entry.kind, entry.isCorrect)}
                  className="group"
                >
                  <CollapsibleTrigger
                    className={cn(triggerClass, "group")}
                    aria-label={`${kindLabel(entry.kind)} ${idx + 1} — ${
                      entry.isCorrect ? "correct" : "incorrect"
                    }, toggle breakdown`}
                  >
                    {labelAndStatus}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SpokenLegBreakdown
                      transcript={answer.transcript}
                      hit={answer.hitElementLabels}
                      missedRequired={answer.missedRequiredLabels}
                      missedOptional={answer.missedOptionalLabels}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={onBackToDashboard}>
          Choose Another
        </Button>
        <Button size="lg" onClick={onPlayAgain}>
          Try Again
        </Button>
      </div>

      <Card className="bg-[var(--ifr-surface-muted)] p-4 text-xs leading-relaxed text-[var(--ifr-text-muted)] shadow-none">
        <p className="mb-1 font-semibold uppercase tracking-wider">Reminder</p>
        <p>
          These scenarios are study material drawn from AIP Australia and MATS — they
          are not a substitute for current AIP, ERSA, NOTAMs, or your operator&apos;s
          standard operating procedures. Always verify against the current source
          before flight.
        </p>
      </Card>
    </div>
  );
}

interface SpokenLegBreakdownProps {
  transcript: string;
  hit: string[];
  missedRequired: string[];
  missedOptional: string[];
}

function SpokenLegBreakdown({
  transcript,
  hit,
  missedRequired,
  missedOptional,
}: SpokenLegBreakdownProps) {
  return (
    <div className="border-t border-current/10 px-3 pb-3 pt-2 text-xs">
      {transcript && (
        <div className="mb-2">
          <p className="font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
            You said
          </p>
          <p className="mt-0.5 italic text-[var(--ifr-text)]">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}
      <ul className="space-y-1" aria-label="Element breakdown">
        {hit.map((label) => (
          <li
            key={`hit-${label}`}
            className="flex items-center gap-2 text-[var(--ifr-success)]"
          >
            <Check size={12} aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
        {missedRequired.map((label) => (
          <li
            key={`req-${label}`}
            className="flex items-center gap-2 text-[var(--ifr-danger)]"
          >
            <X size={12} aria-hidden="true" />
            <span>
              {label} <span className="opacity-70">— required</span>
            </span>
          </li>
        ))}
        {missedOptional.map((label) => (
          <li
            key={`opt-${label}`}
            className="flex items-center gap-2 text-[var(--ifr-warning)]"
          >
            <AlertCircle size={12} aria-hidden="true" />
            <span>
              {label} <span className="opacity-70">— recommended</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
