"use client";

import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { QuizDashboard } from "@/components/quiz/QuizDashboard";
import { QuizSession } from "@/components/quiz/QuizSession";
import { QuizResults } from "@/components/quiz/QuizResults";
import { ProgramSelector } from "@/components/ProgramSelector";
import { ToastContainer } from "@/components/ui/Toast";
import { useQuizSession } from "@/hooks/useQuizSession";
import { useToast } from "@/hooks/useToast";
import { useDrill } from "@/hooks/useDrill";
import { sections } from "@/data/sections";
import type { ProgramId } from "@/types/programs";
import type { QuizOptionId } from "@/types/drill";

// Streak milestones to celebrate
const STREAK_MILESTONES = new Set([3, 5, 10, 15, 20]);

function QuizPageContent() {
  const [programId, setProgramId] = useState<ProgramId>("cheat_sheet");
  const { toasts, show: showToast, dismiss } = useToast();

  // Track last streak milestone fired so we don't repeat it
  const lastMilestoneRef = useRef<number>(0);

  // Get available questions count
  const { filteredQuestions } = useDrill(sections, { programId });

  // Quiz session state
  const session = useQuizSession({
    sections,
    programId,
  });

  // Pause modal state
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Handle pause
  const handlePause = () => {
    session.pause();
    setShowPauseModal(true);
  };

  // Handle resume
  const handleResume = () => {
    setShowPauseModal(false);
    session.resume();
  };

  // Handle end session from pause menu
  const handleEndFromPause = () => {
    setShowPauseModal(false);
    session.endSession();
  };

  // Wrapped selectOption with streak milestone toasts
  const handleSelectOption = useCallback(
    (optionId: QuizOptionId) => {
      session.selectOption(optionId);

      // Peek at what the new streak will be
      const correct = optionId === session.currentQuestion?.correctOptionId;
      const newStreak = correct ? session.streak + 1 : 0;

      if (
        correct &&
        STREAK_MILESTONES.has(newStreak) &&
        newStreak !== lastMilestoneRef.current
      ) {
        lastMilestoneRef.current = newStreak;
        const msgs: Record<number, { msg: string; icon: string }> = {
          3:  { msg: "3 in a row! 🔥", icon: "🔥" },
          5:  { msg: "5 streak — on a roll!", icon: "⚡" },
          10: { msg: "10 correct! Crushing it!", icon: "🏆" },
          15: { msg: "15 straight — you're flying!", icon: "✈️" },
          20: { msg: "20-question streak! Incredible!", icon: "🎯" },
        };
        const m = msgs[newStreak];
        if (m) {
          showToast({
            message: m.msg,
            icon: m.icon,
            variant: "milestone",
            durationMs: 2800,
          });
        }
      }
    },
    [session, showToast]
  );

  // Show completion toast when results phase starts
  useEffect(() => {
    if (session.phase !== "results" || !session.result) return;
    const pct = Math.round(
      (session.result.correctAnswers / session.result.totalQuestions) * 100
    );
    if (pct >= 90) {
      showToast({
        message: `Excellent — ${pct}%! IFR ready. ✈️`,
        variant: "success",
        durationMs: 4000,
      });
    } else if (pct >= 70) {
      showToast({
        message: `Quiz complete — ${pct}%. Good work!`,
        variant: "success",
        durationMs: 3500,
      });
    } else {
      showToast({
        message: `Quiz complete — ${pct}%. Review your weak areas.`,
        detail: "Check the section breakdown below.",
        variant: "info",
        durationMs: 4000,
      });
    }
  }, [session.phase, session.result, showToast]);

  // Render based on phase
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      {/* Toast layer */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Program selector - only show on dashboard */}
      {session.phase === "dashboard" && (
        <ProgramSelector value={programId} onChange={setProgramId} />
      )}

      {/* Dashboard phase */}
      {session.phase === "dashboard" && (
        <QuizDashboard
          config={session.config}
          onChangeConfig={session.setConfig}
          onStart={session.startSession}
          availableQuestions={filteredQuestions.length}
        />
      )}

      {/* Session phase */}
      {session.phase === "session" && session.currentQuestion && (
        <>
          <QuizSession
            mode={session.config.mode}
            currentQuestion={session.currentQuestion}
            currentIndex={session.currentIndex}
            totalQuestions={session.totalQuestions}
            selectedOptionId={session.selectedOptionId}
            score={session.score}
            streak={session.streak}
            lives={session.lives}
            timeRemaining={session.timeRemaining}
            isPaused={session.isPaused}
            flaggedQuestions={session.flaggedQuestions}
            onSelectOption={handleSelectOption}
            onNext={session.nextQuestion}
            onSkip={session.skipQuestion}
            onFlag={session.flagQuestion}
            onPause={handlePause}
            onTimeout={session.onTimeout}
          />

          {/* Pause Modal */}
          {showPauseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 shadow-xl">
                <h2 className="mb-4 text-lg font-semibold text-[var(--ifr-text)]">
                  Paused
                </h2>
                <p className="mb-6 text-sm text-[var(--ifr-text-muted)]">
                  Question {session.currentIndex + 1} of {session.totalQuestions}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleResume}
                    className="w-full rounded-lg bg-[var(--ifr-accent)] py-3 font-medium text-white transition-colors hover:bg-[var(--ifr-accent)]/90 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    Resume
                  </button>
                  <button
                    onClick={handleEndFromPause}
                    className="w-full rounded-lg border border-[var(--ifr-border)] py-3 font-medium text-[var(--ifr-text)] transition-colors hover:bg-[var(--ifr-surface-muted)]"
                  >
                    End Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Results phase */}
      {session.phase === "results" && session.result && (
        <QuizResults
          result={session.result}
          questions={session.questions}
          onPlayAgain={session.startSession}
          onBackToMenu={session.resetToDashboard}
        />
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1100px] px-6 py-6">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--ifr-accent)] border-t-transparent" />
          </div>
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
