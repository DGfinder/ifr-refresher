"use client";

import { useState, useMemo } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ProgressRing } from "./ui/ProgressRing";
import { Confetti } from "./ui/Confetti";
import { getScoreFeedback, formatDuration } from "@/features/quiz/model/scoring";
import { sections } from "@/content/registry/sections";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import type { QuizAnswer, QuizResult } from "@/features/quiz/model/types";
import type { QuizQuestion } from "@/features/drill";

interface QuizResultsProps {
  result: QuizResult;
  questions: QuizQuestion[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function QuizResults({
  result,
  questions,
  onPlayAgain,
  onBackToMenu,
}: QuizResultsProps) {
  const [showMistakes, setShowMistakes] = useState(false);

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const feedback = getScoreFeedback(percentage);
  const shouldCelebrate = percentage >= 70;

  // Get questions that were answered incorrectly
  const mistakes = useMemo(() => {
    return result.answers
      .filter((answer) => !answer.isCorrect && !answer.skipped)
      .map((answer) => {
        const question = questions.find((q) => q.id === answer.questionId);
        return question ? { answer, question } : null;
      })
      .filter(Boolean) as Array<{ answer: QuizAnswer; question: QuizQuestion }>;
  }, [result.answers, questions]);

  // Section breakdown
  const sectionBreakdown = useMemo(() => {
    return Object.entries(result.bySection)
      .map(([sectionId, stats]) => ({
        sectionId,
        percentage: Math.round((stats.correct / stats.total) * 100),
        correct: stats.correct,
        total: stats.total,
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, [result.bySection]);

  if (showMistakes) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMistakes(false)}
          className="mb-4 -ml-2 h-auto gap-2 px-2 py-1 text-sm font-normal"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </Button>

        <h2 className="mb-4 text-lg font-semibold text-[var(--ifr-text)]">
          Review Mistakes ({mistakes.length})
        </h2>

        <div className="space-y-4">
          {mistakes.map(({ answer, question }, index) => (
            <Card key={question.id} className="p-4">
              <div className="mb-3 text-sm text-[var(--ifr-text-muted)]">
                Question {index + 1}
              </div>
              <p className="mb-4 font-medium text-[var(--ifr-text)]">
                {question.prompt}
              </p>

              <div className="space-y-2">
                {question.options.map((option) => {
                  const isCorrect = option.id === question.correctOptionId;
                  const wasSelected = option.id === answer.selectedOptionId;

                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm",
                        isCorrect && "border-[var(--ifr-success)] bg-[var(--ifr-success)]/5",
                        wasSelected && !isCorrect && "border-[var(--ifr-danger)] bg-[var(--ifr-danger)]/5",
                        !isCorrect && !wasSelected && "border-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold",
                          isCorrect && "text-[var(--ifr-success)]",
                          wasSelected && !isCorrect && "text-[var(--ifr-danger)]"
                        )}
                      >
                        {option.id}.
                      </span>
                      <span className={cn(
                        isCorrect && "text-[var(--ifr-success)]",
                        wasSelected && !isCorrect && "text-[var(--ifr-danger)] line-through"
                      )}>
                        {option.text}
                      </span>
                      {isCorrect && (
                        <span className="ml-auto text-xs text-[var(--ifr-success)]">Correct</span>
                      )}
                      {wasSelected && !isCorrect && (
                        <span className="ml-auto text-xs text-[var(--ifr-danger)]">Your answer</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Confetti trigger={shouldCelebrate} intensity={percentage >= 90 ? "high" : "medium"} />

      {/* Main score display */}
      <div className="mb-8 text-center">
        <ProgressRing progress={percentage} size={140} strokeWidth={10}>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--ifr-text)]">{percentage}%</div>
          </div>
        </ProgressRing>
        <h2 className="mt-4 text-xl font-semibold text-[var(--ifr-text)]">
          {feedback.message}
        </h2>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--ifr-text)]">
            {result.correctAnswers}/{result.totalQuestions}
          </div>
          <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Correct</div>
        </div>
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--ifr-text)]">
            {result.score.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Points</div>
        </div>
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--ifr-text)]">
            {result.maxStreak}
          </div>
          <div className="mt-1 text-xs text-[var(--ifr-text-muted)]">Max Streak</div>
        </div>
      </div>

      {/* Time */}
      <div className="mb-6 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ifr-text-muted)]">Time</span>
          <span className="font-medium text-[var(--ifr-text)]">
            {formatDuration(result.timeSpent)}
          </span>
        </div>
      </div>

      {/* Section breakdown */}
      {sectionBreakdown.length > 1 && (
        <Card className="mb-6 p-4">
          <h3 className="mb-3 text-sm font-medium text-[var(--ifr-text-muted)]">
            By Topic
          </h3>
          <div className="space-y-3">
            {sectionBreakdown.map((section) => (
              <div key={section.sectionId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate text-[var(--ifr-text)]">
                    {sections.find((s) => s.sectionId === section.sectionId)?.sectionTitle ?? section.sectionId.replace(/-/g, " ")}
                  </span>
                  <span className="text-[var(--ifr-text-muted)]">
                    {section.percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={section.percentage}
                  className="h-2 bg-[var(--ifr-surface-muted)]"
                  indicatorClassName={cn(
                    section.percentage >= 80 && "bg-[var(--ifr-success)]",
                    section.percentage >= 60 && section.percentage < 80 && "bg-[var(--ifr-warning)]",
                    section.percentage < 60 && "bg-[var(--ifr-danger)]"
                  )}
                  aria-label={`${section.sectionId} quiz result`}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {mistakes.length > 0 && (
          <Button variant="secondary" size="lg" onClick={() => setShowMistakes(true)}>
            Review Mistakes
          </Button>
        )}
        <Button
          size="lg"
          onClick={onPlayAgain}
          className={cn(mistakes.length === 0 && "col-span-2")}
        >
          Quiz Me Again
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={onBackToMenu}
        className="mt-3 w-full text-sm font-normal text-[var(--ifr-text-muted)]"
      >
        Back to Dashboard
      </Button>

      <p className="mt-4 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] px-3 py-2 text-xs leading-relaxed text-[var(--ifr-text-muted)]">
        <span className="font-semibold uppercase tracking-wider">Reminder · </span>
        Study aid only. Verify against current CASA, AIP, ERSA, aircraft manuals, and operator
        procedures before flight.
      </p>
    </div>
  );
}
