"use client";

import type { QuizQuestion, QuizOptionId } from "@/types/drill";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: QuizQuestion;
  selectedOptionId: QuizOptionId | null;
  onSelectOption: (optionId: QuizOptionId) => void;
  onNext: () => void;
}

export function QuizCard({
  question,
  selectedOptionId,
  onSelectOption,
  onNext,
}: QuizCardProps) {
  const isAnswered = selectedOptionId !== null;
  const isCorrect = selectedOptionId === question.correctOptionId;

  return (
    <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] shadow-sm">
      {/* Question prompt */}
      <div className="p-6">
        <p className="text-[18px] font-medium text-[var(--ifr-text)]">{question.prompt}</p>
      </div>

      {/* Options */}
      <div className="border-t border-[var(--ifr-border)] p-4 space-y-3">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrectOption = option.id === question.correctOptionId;
          const showCorrect = isAnswered && isCorrectOption;
          const showIncorrect = isAnswered && isSelected && !isCorrectOption;

          return (
            <button
              key={option.id}
              onClick={() => !isAnswered && onSelectOption(option.id)}
              disabled={isAnswered}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors",
                !isAnswered && "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-surface-muted)]",
                isAnswered && "cursor-default",
                showCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)]/10",
                showIncorrect && "border-[var(--ifr-error)] bg-[var(--ifr-error)]/10",
                !showCorrect && !showIncorrect && "border-[var(--ifr-border)]"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  showCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)] text-white",
                  showIncorrect && "border-[var(--ifr-error)] bg-[var(--ifr-error)] text-white",
                  !showCorrect && !showIncorrect && "border-[var(--ifr-border)] text-[var(--ifr-text-muted)]"
                )}
              >
                {option.id}
              </span>
              <span
                className={cn(
                  "flex-1 pt-0.5 text-sm",
                  showCorrect && "text-[var(--ifr-success)] font-medium",
                  showIncorrect && "text-[var(--ifr-error)]",
                  !showCorrect && !showIncorrect && "text-[var(--ifr-text)]"
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback and Next button */}
      {isAnswered && (
        <div className="border-t border-[var(--ifr-border)] p-4">
          <div
            className={cn(
              "mb-4 rounded-md px-4 py-2 text-center text-sm font-medium",
              isCorrect
                ? "bg-[var(--ifr-success)]/10 text-[var(--ifr-success)]"
                : "bg-[var(--ifr-error)]/10 text-[var(--ifr-error)]"
            )}
          >
            {isCorrect ? "Correct!" : "Incorrect"}
          </div>
          <button
            onClick={onNext}
            className="w-full rounded-lg bg-[var(--ifr-accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--ifr-accent)]/90"
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}
