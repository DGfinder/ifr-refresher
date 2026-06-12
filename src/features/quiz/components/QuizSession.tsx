"use client";

import { useEffect } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Timer } from "./ui/Timer";
import { StreakCounter } from "./ui/StreakCounter";
import { ScoreDisplay } from "./ui/ScoreDisplay";
import { LivesDisplay } from "./ui/LivesDisplay";
import { useKeyboardNav } from "@/features/quiz/hooks/useKeyboardNav";
import { useQuizTimer } from "@/features/quiz/hooks/useQuizTimer";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import type { QuizQuestion, QuizOptionId } from "@/features/drill";
import type { QuizGameMode } from "@/features/quiz/model/types";

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

  const flashState = isAnswered ? (isCorrect ? "correct" : "incorrect") : null;

  // Timer hook for timed mode
  const timer = useQuizTimer({
    initialTime: timeRemaining,
    onTimeout,
    autoStart: showTimer && !isPaused,
  });
  const { reset: resetTimer, start: startTimer, pause: pauseTimer, resume: resumeTimer } = timer;

  // Sync external time with timer
  useEffect(() => {
    if (showTimer) {
      resetTimer(timeRemaining);
      if (!isPaused) {
        startTimer();
      }
    }
  }, [currentIndex, isPaused, showTimer, timeRemaining, resetTimer, startTimer]); // Reset timer on question change

  // Pause/resume timer
  useEffect(() => {
    if (isPaused) {
      pauseTimer();
    } else if (showTimer && !isAnswered) {
      resumeTimer();
    }
  }, [isPaused, isAnswered, showTimer, pauseTimer, resumeTimer]);

  // Stop timer when answered
  useEffect(() => {
    if (isAnswered) {
      pauseTimer();
    }
  }, [isAnswered, pauseTimer]);

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
        <Button
          variant="ghost"
          size="icon"
          onClick={onPause}
          aria-label="Pause"
          className="text-[var(--ifr-text-muted)]"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>

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
      <ProgressBar value={progressPercent} className="mb-6 h-2 bg-[var(--ifr-surface-muted)]" aria-label="Quiz progress" />

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
            <Button onClick={onNext} size="lg" className="w-full">
              {currentIndex + 1 >= totalQuestions ? "See Results" : "Next Question"}
            </Button>
          </div>
        )}

        {/* Pre-answer actions */}
        {!isAnswered && (
          <div className="flex items-center justify-between border-t border-[var(--ifr-border)] p-4">
            {mode === "learn" ? (
              <Button
                variant="link"
                size="sm"
                onClick={onSkip}
                className="h-auto px-0 py-0 text-sm font-normal text-[var(--ifr-text-muted)] no-underline hover:text-[var(--ifr-text)] hover:underline"
              >
                Skip
              </Button>
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
