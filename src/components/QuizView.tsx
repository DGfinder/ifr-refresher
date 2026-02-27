"use client";

import type { Section } from "@/types/section";
import type { ProgramId } from "@/types/programs";
import { useDrill } from "@/hooks/useDrill";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizCard } from "./QuizCard";

interface QuizViewProps {
  sections: Section[];
  programId: ProgramId;
}

export function QuizView({ sections, programId }: QuizViewProps) {
  const { filteredQuestions } = useDrill(sections, { programId });

  // God mode gets more questions
  const limit = programId === "god_mode" ? 20 : 10;

  const {
    mode,
    currentQuestion,
    currentIndex,
    selectedOptionId,
    stats,
    selectOption,
    nextQuestion,
    restart,
    start,
  } = useQuiz({ drillQuestions: filteredQuestions, limit });

  // Idle state - Start Quiz button
  if (mode === "idle") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--ifr-accent)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Ready for the Quiz?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredQuestions.length > 0
              ? `${Math.min(limit, filteredQuestions.length)} questions from your selected sections`
              : "No questions available with current selection"}
          </p>
          {filteredQuestions.length > 0 && (
            <button
              onClick={start}
              className="mt-6 rounded-lg bg-[var(--ifr-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--ifr-accent)]/90"
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // Finished state - Score and Try Again
  if (mode === "finished") {
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isPassing = percentage >= 70;

    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              isPassing ? "bg-[var(--ifr-success)]/10" : "bg-[var(--ifr-warning)]/10"
            }`}
          >
            <span
              className={`text-3xl font-bold ${
                isPassing ? "text-[var(--ifr-success)]" : "text-[var(--ifr-warning)]"
              }`}
            >
              {percentage}%
            </span>
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {isPassing ? "Great job!" : "Keep practicing!"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You got {stats.correct} out of {stats.total} questions correct
          </p>
          <button
            onClick={restart}
            className="mt-6 rounded-lg bg-[var(--ifr-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--ifr-accent)]/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // In-progress state - Progress bar + QuizCard
  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentIndex + 1} of {stats.total}</span>
          <span>{stats.correct} correct</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--ifr-surface-muted)]">
          <div
            className="h-2 rounded-full bg-[var(--ifr-accent)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / stats.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz card */}
      {currentQuestion && (
        <QuizCard
          question={currentQuestion}
          selectedOptionId={selectedOptionId}
          onSelectOption={selectOption}
          onNext={nextQuestion}
        />
      )}
    </div>
  );
}
