"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioReadback } from "@/content/model/radio";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

interface ReadbackBuilderProps {
  readback: RadioReadback;
  selectedChipIds: ReadonlySet<string>;
  isSubmitted: boolean;
  onToggleChip: (chipId: string) => void;
  onSubmit: () => void;
}

export function ReadbackBuilder({
  readback,
  selectedChipIds,
  isSubmitted,
  onToggleChip,
  onSubmit,
}: ReadbackBuilderProps) {
  const requiredSet = new Set(readback.requiredIds);

  // Compute the per-chip state once for the (mostly correct) reveal styling.
  const chipStates = readback.chips.map((chip) => {
    const isSelected = selectedChipIds.has(chip.id);
    const isRequired = requiredSet.has(chip.id);
    let reveal: "correct-keep" | "missed" | "extra" | "correctly-skipped" | null = null;
    if (isSubmitted) {
      if (isSelected && isRequired) reveal = "correct-keep";
      else if (!isSelected && isRequired) reveal = "missed";
      else if (isSelected && !isRequired) reveal = "extra";
      else reveal = "correctly-skipped";
    }
    return { chip, isSelected, isRequired, reveal };
  });

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold text-[var(--ifr-text-muted)]">
        Required readback
      </p>
      <p className="mb-4 text-base leading-relaxed text-[var(--ifr-text)]">
        {readback.prompt}
      </p>

      <ul
        className="flex flex-wrap gap-2"
        aria-label="Readback element options"
        role="group"
      >
        {chipStates.map(({ chip, isSelected, reveal }) => (
          <li key={chip.id}>
            <button
              type="button"
              onClick={() => onToggleChip(chip.id)}
              disabled={isSubmitted}
              aria-pressed={isSelected}
              aria-label={
                isSubmitted
                  ? `${chip.text} — ${reveal === "correct-keep" ? "correctly selected" : reveal === "missed" ? "you missed this required item" : reveal === "extra" ? "this was not required" : "correctly left out"}`
                  : chip.text
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                !isSubmitted && [
                  isSelected
                    ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                    : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text)] hover:border-[var(--ifr-accent)]/50",
                  "active:scale-[0.97]",
                ],
                isSubmitted && reveal === "correct-keep" &&
                  "border-[var(--ifr-success)] bg-[var(--ifr-success)]/10 text-[var(--ifr-success)]",
                isSubmitted && reveal === "missed" &&
                  "border-[var(--ifr-danger)] bg-[var(--ifr-danger)]/10 text-[var(--ifr-danger)]",
                isSubmitted && reveal === "extra" &&
                  "border-[var(--ifr-danger)] bg-[var(--ifr-danger)]/10 text-[var(--ifr-danger)] line-through",
                isSubmitted && reveal === "correctly-skipped" &&
                  "border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
                isSubmitted && "cursor-default",
              )}
            >
              {isSubmitted && reveal === "correct-keep" && <Check size={12} aria-hidden="true" />}
              {isSubmitted && (reveal === "extra" || reveal === "missed") && (
                <X size={12} aria-hidden="true" />
              )}
              <span>{chip.text}</span>
            </button>
          </li>
        ))}
      </ul>

      {!isSubmitted ? (
        <Button
          onClick={onSubmit}
          disabled={selectedChipIds.size === 0}
          size="lg"
          className="mt-4 w-full"
        >
          Submit readback ({selectedChipIds.size} selected)
        </Button>
      ) : (
        readback.explanation && (
          <div className="mt-4 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-3 text-sm text-[var(--ifr-text)]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
              Why
            </p>
            <p className="leading-relaxed">{readback.explanation}</p>
          </div>
        )
      )}
    </Card>
  );
}
