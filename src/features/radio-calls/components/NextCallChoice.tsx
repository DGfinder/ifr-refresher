"use client";

import { cn } from "@/shared/lib/cn";
import type { RadioMCQ, RadioOptionId } from "@/content/model/radio";
import { Card } from "@/shared/ui/card";

interface NextCallChoiceProps {
  question: RadioMCQ;
  selectedOptionId: RadioOptionId | null;
  onSelect: (optionId: RadioOptionId) => void;
}

export function NextCallChoice({ question, selectedOptionId, onSelect }: NextCallChoiceProps) {
  const isAnswered = selectedOptionId !== null;

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold text-[var(--ifr-text-muted)]">
        Your call
      </p>
      <p className="mb-4 text-base leading-relaxed text-[var(--ifr-text)]">
        {question.prompt}
      </p>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrectOption = option.id === question.correctOptionId;
          const showCorrect = isAnswered && isCorrectOption;
          const showIncorrect = isAnswered && isSelected && !isCorrectOption;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !isAnswered && onSelect(option.id)}
              disabled={isAnswered}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm leading-relaxed transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                !isAnswered && [
                  "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-surface-muted)]",
                  "active:scale-[0.985]",
                ],
                isAnswered && "cursor-default",
                showCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)]/10",
                showIncorrect && "border-[var(--ifr-danger)] bg-[var(--ifr-danger)]/10",
                !showCorrect && !showIncorrect && isSelected && "border-[var(--ifr-accent)]/60",
                !showCorrect && !showIncorrect && !isSelected && "border-[var(--ifr-border)]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  showCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)] text-white",
                  showIncorrect && "border-[var(--ifr-danger)] bg-[var(--ifr-danger)] text-white",
                  !showCorrect && !showIncorrect && "border-[var(--ifr-border)] text-[var(--ifr-text-muted)]",
                )}
              >
                {option.id}
              </span>
              <span
                className={cn(
                  "flex-1 pt-0.5",
                  showCorrect && "font-medium text-[var(--ifr-success)]",
                  showIncorrect && "text-[var(--ifr-danger)]",
                  !showCorrect && !showIncorrect && "text-[var(--ifr-text)]",
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {isAnswered && question.explanation && (
        <div className="mt-4 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-3 text-sm text-[var(--ifr-text)]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
            Why
          </p>
          <p className="leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
}
