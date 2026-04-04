"use client";

import { useMemo } from "react";
import type { DrillQuestion } from "@/types/drill";
import type { ProgramId } from "@/types/programs";
import type { DrillState } from "@/types/drill";
import { ProgramSelector } from "@/components/ProgramSelector";
import { useDrill } from "@/hooks/useDrill";
import { sections } from "@/data/sections";
import { cn } from "@/lib/utils";

export type StudyMode = "all" | "weak" | "new";

interface FlashcardDashboardProps {
  programId: ProgramId;
  onChangeProgramId: (id: ProgramId) => void;
  studyMode: StudyMode;
  onChangeStudyMode: (mode: StudyMode) => void;
  onStart: (queue: DrillQuestion[]) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildSessionQueue(
  questions: DrillQuestion[],
  stats: DrillState,
  mode: StudyMode
): DrillQuestion[] {
  if (mode === "new") {
    return shuffle(questions.filter((q) => !stats[q.id] || stats[q.id].seenCount === 0));
  }
  if (mode === "weak") {
    return shuffle(
      questions.filter((q) => {
        const s = stats[q.id];
        if (!s) return false;
        return s.unsureCount > s.gotItCount;
      })
    );
  }
  // "all": unseen first, then seen
  const unseen = questions.filter((q) => !stats[q.id] || stats[q.id].seenCount === 0);
  const seen = questions.filter((q) => stats[q.id] && stats[q.id].seenCount > 0);
  return [...shuffle(unseen), ...shuffle(seen)];
}

const MODES: { id: StudyMode; label: string; description: string }[] = [
  { id: "all", label: "All Cards", description: "Unseen first, then revisit reviewed cards" },
  { id: "weak", label: "Weak Spots", description: "Only cards you marked Unsure — drill until solid" },
  { id: "new", label: "Fresh Cards", description: "Cards you've never seen — zero distractions" },
];

export function FlashcardDashboard({
  programId,
  onChangeProgramId,
  studyMode,
  onChangeStudyMode,
  onStart,
}: FlashcardDashboardProps) {
  const { filteredQuestions, stats, getWeakCount, getSeenCount } = useDrill(sections, {
    programId,
  });

  const newCount = filteredQuestions.filter(
    (q) => !stats[q.id] || stats[q.id].seenCount === 0
  ).length;
  const weakCount = getWeakCount();
  const totalCount = filteredQuestions.length;
  const seenCount = getSeenCount();

  const queueSize = useMemo(() => {
    if (studyMode === "new") return newCount;
    if (studyMode === "weak") return weakCount;
    return totalCount;
  }, [studyMode, newCount, weakCount, totalCount]);

  const handleStart = () => {
    const queue = buildSessionQueue(filteredQuestions, stats, studyMode);
    if (queue.length > 0) onStart(queue);
  };

  return (
    <div className="space-y-6">
      {/* Program selector */}
      <ProgramSelector value={programId} onChange={onChangeProgramId} />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--ifr-text)]">{newCount}</div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">New</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {weakCount}
          </div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Weak</div>
        </div>
        <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center">
          <div className="text-2xl font-bold tabular-nums text-[var(--ifr-text)]">{totalCount}</div>
          <div className="mt-1 text-xs font-medium text-[var(--ifr-text-muted)]">Total</div>
        </div>
      </div>

      {/* Progress bar */}
      {seenCount > 0 && totalCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[var(--ifr-text-muted)]">
            <span>Progress</span>
            <span>
              {seenCount} / {totalCount} seen
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ifr-border)]">
            <div
              className="h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-300"
              style={{ width: `${(seenCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Study mode pills */}
      <div>
        <p className="mb-3 text-sm font-medium text-[var(--ifr-text)]">Study mode</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChangeStudyMode(mode.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                studyMode === mode.id
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:border-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
              )}
            >
              <div className="text-sm font-semibold">{mode.label}</div>
              <div className="mt-0.5 text-xs leading-tight opacity-70">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-2">
        {queueSize === 0 ? (
          <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-5 text-center">
            <p className="text-sm font-medium text-[var(--ifr-text)]">
              {studyMode === "weak"
                ? "No weak cards — you've nailed this set. 🎯"
                : studyMode === "new"
                ? "No new cards left in this program."
                : "No cards available for this mode."}
            </p>
            <p className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              {studyMode === "weak"
                ? 'Switch to "All Cards" to keep your edge sharp.'
                : studyMode === "new"
                ? 'Switch to "All Cards" to revisit everything.'
                : "Try a different study mode or program."}
            </p>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-[var(--ifr-accent)] py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-[var(--ifr-accent)]/90 active:scale-[0.98] dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Study Now — {queueSize} card{queueSize !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    </div>
  );
}
