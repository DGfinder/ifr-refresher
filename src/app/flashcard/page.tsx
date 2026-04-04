"use client";

import { useState, useRef, Suspense } from "react";
import { FlashcardDashboard, buildSessionQueue, type StudyMode } from "@/components/flashcard/FlashcardDashboard";
import { FlashcardSession, type SessionResults } from "@/components/flashcard/FlashcardSession";
import { FlashcardResults } from "@/components/flashcard/FlashcardResults";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useDrill } from "@/hooks/useDrill";
import { sections } from "@/data/sections";
import type { ProgramId } from "@/types/programs";
import type { DrillQuestion } from "@/types/drill";

type FlashcardPhase = "dashboard" | "session" | "results";

function FlashcardPageContent() {
  const [phase, setPhase] = useState<FlashcardPhase>("dashboard");
  const [programId, setProgramId] = useState<ProgramId>("cheat_sheet");
  const [studyMode, setStudyMode] = useState<StudyMode>("all");
  const [sessionQueue, setSessionQueue] = useState<DrillQuestion[]>([]);
  const [lastResults, setLastResults] = useState<SessionResults | null>(null);
  const { toasts, show: showToast, dismiss } = useToast();
  const prevPctRef = useRef<number | null>(null);

  const { filteredQuestions, stats, getWeakCount } = useDrill(sections, { programId });

  const handleStart = (queue: DrillQuestion[]) => {
    setSessionQueue(queue);
    setPhase("session");
  };

  const handleSessionEnd = (results: SessionResults) => {
    setLastResults(results);
    setPhase("results");

    // Toast on completion
    const pct = results.total > 0 ? Math.round((results.gotIt / results.total) * 100) : 0;
    if (pct >= 90) {
      showToast({
        message: `Nailed it — ${pct}% solid! ✈️`,
        variant: "success",
        durationMs: 4000,
      });
    } else if (pct >= 70) {
      showToast({
        message: `Session done — ${pct}% confirmed.`,
        variant: "success",
        durationMs: 3500,
      });
    } else if (results.total > 0) {
      showToast({
        message: "Session complete — focus on those weak cards.",
        variant: "info",
        durationMs: 3500,
      });
    }

    // Personal best toast
    if (prevPctRef.current !== null && pct > prevPctRef.current && pct >= 90) {
      showToast({
        message: "New personal best! 🏆",
        variant: "milestone",
        durationMs: 3000,
      });
    }
    prevPctRef.current = pct;
  };

  const handleStudyWeak = () => {
    const weakQueue = buildSessionQueue(filteredQuestions, stats, "weak");
    setSessionQueue(weakQueue);
    setStudyMode("weak");
    setPhase("session");
  };

  const handleBackToMenu = () => {
    setPhase("dashboard");
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      {/* Toast layer */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {phase === "dashboard" && (
        <FlashcardDashboard
          programId={programId}
          onChangeProgramId={setProgramId}
          studyMode={studyMode}
          onChangeStudyMode={setStudyMode}
          onStart={handleStart}
        />
      )}

      {phase === "session" && (
        <FlashcardSession
          queue={sessionQueue}
          programId={programId}
          onEnd={handleSessionEnd}
        />
      )}

      {phase === "results" && lastResults && (
        <FlashcardResults
          results={lastResults}
          weakCount={getWeakCount()}
          onStudyWeak={handleStudyWeak}
          onNewSession={handleBackToMenu}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default function FlashcardPage() {
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
      <FlashcardPageContent />
    </Suspense>
  );
}
