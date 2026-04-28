"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Timer } from "./ui/Timer";
import { StreakCounter } from "./ui/StreakCounter";
import { ScoreDisplay } from "./ui/ScoreDisplay";
import { LivesDisplay } from "./ui/LivesDisplay";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import type { QuizQuestion, QuizOptionId } from "@/types/drill";
import type { QuizGameMode } from "@/types/quiz";

interface QuizSessionProps {
  mode: QuizGameMode;
  currentQuestion: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: QuizOptionId | null;
  score: number;
  streak: number;
  lives: number;
  timeRemaining: number;
  isPaused: boolean;
  flaggedQuestions: Set<string>;
  onSelectOption: (optionId: QuizOptionId) => void;
  onNext: () => void;
  onSkip: () => void;
  onFlag: () => void;
  onPause: () => void;
  onTimeout: () => void;
}

export function QuizSession({
  mode,
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  score,
  streak,
  lives,
  timeRemaining,
  isPaused,
  flaggedQuestions,
  onSelectOption,
  onNext,
  onSkip,
  onFlag,
  onPause,
  onTimeout,
}: QuizSessionProps) {
  const isAnswered = selectedOptionId !== null;
  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
  const isFlagged = flaggedQuestions.has(currentQuestion.id);
  const showTimer = mode === "timed";
  const showLives = mode === "challenge";
  const showScore = mode !== "learn";

  // Flash border for 600ms after answering. Derived from props rather
  // than a sync setState-in-effect; the timer flips a "cleared" id so
  // the flash auto-clears without re-rendering on the answer event.
  const [clearedFlashFor, setClearedFlashFor] = useState<string | null>(null);
  const showFlash = isAnswered && clearedFlashFor !== currentQuestion.id;
  const flashState: "correct" | "incorrect" | null = showFlash
    ? (isCorrect ? "correct" : "incorrect")
    : null;

  useEffect(() => {
    if (!isAnswered) return;
    const id = currentQuestion.id;
    const t = setTimeout(() => setClearedFlashFor(id), 600);
    return () => clearTimeout(t);
  }, [isAnswered, currentQuestion.id]);

  // Timer hook for timed mode
  const timer = useQuizTimer({
    initialTime: timeRemaining,
    onTimeout,
    autoStart: showTimer && !isPaused,
  });

  // Sync external time with timer
  useEffect(() => {
    if (showTimer) {
      timer.reset(timeRemaining);
      if (!isPaused) {
        timer.start();
      }
    }
  }, [currentIndex]); // Reset timer on question change

  // Pause/resume timer
  useEffect(() => {
    if (isPaused) {
      timer.pause();
    } else if (showTimer && !isAnswered) {
      timer.resume();
    }
  }, [isPaused]);

  // Stop timer when answered
  useEffect(() => {
    if (isAnswered) {
      timer.pause();
    }
  }, [isAnswered]);

  // Keyboard navigation
  useKeyboardNav({
    onSelectOption,
    onNext,
    onPause,
    onSkip: mode === "learn" ? onSkip : undefined,
    isAnswered,
    isEnabled: !isPaused,
  });

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPause}
          className="rounded-lg p-2 text-[var(--ifr-text-muted)] transition-colors hover:bg-[var(--ifr-surface-muted)] hover:text-[var(--ifr-text)]"
          aria-label="Pause"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {showLives && <LivesDisplay lives={lives} />}
          {showScore && <ScoreDisplay score={score} streak={streak} />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2 flex items-center justify-between text-sm text-[var(--ifr-text-muted)]">
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <div className="flex items-center gap-3">
          <StreakCounter streak={streak} />
          {showTimer && (
            <Timer
              timeRemaining={timer.timeRemaining}
              isRunning={timer.isRunning}
              onTimeout={onTimeout}
            />
          )}
        </div>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--ifr-surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question card — flash border on answer */}
      <div
        className={cn(
          "rounded-xl border-2 bg-[var(--ifr-surface)] shadow-lg transition-colors duration-300",
          flashState === "correct" && "border-[var(--ifr-success)]",
          flashState === "incorrect" && "border-[var(--ifr-danger)]",
          !flashState && "border-[var(--ifr-border)]"
        )}
      >
        {/* Question */}
        <div className="p-6">
          <p className="text-lg font-medium leading-relaxed text-[var(--ifr-text)]">
            {currentQuestion.prompt}
          </p>
        </div>

        {/* Options */}
        <div className="border-t border-[var(--ifr-border)] p-4 space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;
            const showCorrect = isAnswered && isCorrectOption;
            const showIncorrect = isAnswered && isSelected && !isCorrectOption;

            return (
              <button
                key={option.id}
                onClick={() => !isAnswered && onSelectOption(option.id)}
                disabled={isAnswered}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left",
                  "transition-all duration-200",
                  // hover + click micro-interaction (not answered)
                  !isAnswered && [
                    "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-surface-muted)]",
                    "active:scale-[0.985]",
                  ],
                  isAnswered && "cursor-default",
                  showCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)]/10 scale-[1.005]",
                  showIncorrect && "border-[var(--ifr-danger)] bg-[var(--ifr-danger)]/10",
                  !showCorrect && !showIncorrect && isSelected && "border-[var(--ifr-accent)]/60 bg-[var(--ifr-surface-muted)]",
                  !showCorrect && !showIncorrect && !isSelected && "border-[var(--ifr-border)]"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                    showCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)] text-white",
                    showIncorrect && "border-[var(--ifr-danger)] bg-[var(--ifr-danger)] text-white",
                    !showCorrect && !showIncorrect && "border-[var(--ifr-border)] text-[var(--ifr-text-muted)]"
                  )}
                >
                  {option.id}
                </span>
                <span
                  className={cn(
                    "flex-1 pt-0.5 text-sm leading-relaxed",
                    showCorrect && "font-medium text-[var(--ifr-success)]",
                    showIncorrect && "text-[var(--ifr-danger)]",
                    !showCorrect && !showIncorrect && "text-[var(--ifr-text)]"
                  )}
                >
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback and actions */}
        {isAnswered && (
          <div className="border-t border-[var(--ifr-border)] p-4">
            <div
              className={cn(
                "mb-4 rounded-lg px-4 py-3 text-center font-medium",
                isCorrect
                  ? "bg-[var(--ifr-success)]/10 text-[var(--ifr-success)]"
                  : "bg-[var(--ifr-danger)]/10 text-[var(--ifr-danger)]"
              )}
            >
              {isCorrect
                ? streak >= 3
                  ? `Nailed it! ${streak}-answer streak 🔥`
                  : "Correct — well done."
                : "Not quite — check the correct answer above."}
            </div>
            <button
              onClick={onNext}
              className="w-full rounded-lg bg-[var(--ifr-accent)] py-3 font-medium text-white transition-colors hover:bg-[var(--ifr-accent)]/90 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {currentIndex + 1 >= totalQuestions ? "See Results" : "Next Question"}
            </button>
          </div>
        )}

        {/* Pre-answer actions */}
        {!isAnswered && (
          <div className="flex items-center justify-between border-t border-[var(--ifr-border)] p-4">
            {mode === "learn" ? (
              <button
                onClick={onSkip}
                className="text-sm text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
              >
                Skip
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={onFlag}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                isFlagged
                  ? "text-[var(--ifr-warning)]"
                  : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-warning)]"
              )}
            >
              <svg className="h-4 w-4" fill={isFlagged ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              {isFlagged ? "Flagged" : "Flag"}
            </button>
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 text-center text-xs text-[var(--ifr-text-muted)]">
        Press 1-4 to answer {isAnswered && "• Enter for next"}
      </div>
    </div>
  );
}
