"use client";

import { cn } from "@/lib/utils";
import type { QuizGameMode } from "@/types/quiz";

interface SessionConfigProps {
  mode: QuizGameMode;
  questionCount: number | "all";
  timePerQuestion: number;
  onChangeQuestionCount: (count: number | "all") => void;
  onChangeTimePerQuestion: (seconds: number) => void;
  availableQuestions: number;
}

const QUESTION_OPTIONS = [10, 20, 50, "all"] as const;
const TIME_OPTIONS = [15, 30, 45, 60] as const;

export function SessionConfig({
  mode,
  questionCount,
  timePerQuestion,
  onChangeQuestionCount,
  onChangeTimePerQuestion,
  availableQuestions,
}: SessionConfigProps) {
  const showTimeConfig = mode === "timed";

  return (
    <div className="space-y-4">
      {/* Question Count */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--ifr-text-muted)]">
          Questions
        </label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_OPTIONS.map((option) => {
            const value = option === "all" ? availableQuestions : option;
            const isDisabled = typeof option === "number" && option > availableQuestions;
            const isSelected = questionCount === option;

            return (
              <button
                key={String(option)}
                onClick={() => !isDisabled && onChangeQuestionCount(option)}
                disabled={isDisabled}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-[var(--ifr-accent)] text-white"
                    : "bg-[var(--ifr-surface)] border border-[var(--ifr-border)] text-[var(--ifr-text)]",
                  !isSelected && !isDisabled && "hover:border-[var(--ifr-accent)]/50",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option === "all" ? `All (${availableQuestions})` : option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time per Question (only for timed mode) */}
      {showTimeConfig && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--ifr-text-muted)]">
            Time per Question
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((seconds) => {
              const isSelected = timePerQuestion === seconds;

              return (
                <button
                  key={seconds}
                  onClick={() => onChangeTimePerQuestion(seconds)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-[var(--ifr-accent)] text-white"
                      : "bg-[var(--ifr-surface)] border border-[var(--ifr-border)] text-[var(--ifr-text)]",
                    !isSelected && "hover:border-[var(--ifr-accent)]/50"
                  )}
                >
                  {seconds}s
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode info summary */}
      <div className="rounded-lg bg-[var(--ifr-surface-muted)] px-4 py-3 text-sm text-[var(--ifr-text-muted)]">
        {mode === "classic" && (
          <p>Answer at your own pace. Build streaks for bonus multipliers.</p>
        )}
        {mode === "timed" && (
          <p>
            {timePerQuestion} seconds per question. Fast answers earn bonus points.
          </p>
        )}
        {mode === "learn" && (
          <p>No scoring pressure. Skip questions or reveal answers to study.</p>
        )}
        {mode === "challenge" && (
          <p>3 lives. Wrong answers cost a life. 2x point multiplier.</p>
        )}
      </div>
    </div>
  );
}
