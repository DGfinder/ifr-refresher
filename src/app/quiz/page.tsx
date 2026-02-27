"use client";

import { Suspense, useState } from "react";
import { QuizDashboard } from "@/components/quiz/QuizDashboard";
import { QuizSession } from "@/components/quiz/QuizSession";
import { QuizResults } from "@/components/quiz/QuizResults";
import { ProgramSelector } from "@/components/ProgramSelector";
import { useQuizSession } from "@/hooks/useQuizSession";
import { useDrill } from "@/hooks/useDrill";
import { sections } from "@/data/sections";
import type { ProgramId } from "@/types/programs";

function QuizPageContent() {
  const [programId, setProgramId] = useState<ProgramId>("ipc_oral");

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

  // Render based on phase
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
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
            onSelectOption={session.selectOption}
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
                    className="w-full rounded-lg bg-[var(--ifr-accent)] py-3 font-medium text-white transition-colors hover:bg-[var(--ifr-accent)]/90"
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
