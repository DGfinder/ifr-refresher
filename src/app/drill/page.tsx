"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SessionPresets, type PresetId } from "@/components/SessionPresets";
import { DrillView } from "@/components/DrillView";
import { QuizView } from "@/components/QuizView";
import { ProgramFilter } from "@/components/ProgramFilter";
import { sections } from "@/data/sections";
import { getSectionsForProgram, drillPrograms } from "@/data/drillPrograms";
import { useProgram } from "@/contexts/ProgramContext";
import { cn } from "@/lib/utils";

function DrillPageContent() {
  const searchParams = useSearchParams();
  const { programId, setProgramId } = useProgram();

  // Get initial mode from URL or program default
  const urlMode = searchParams.get("mode");
  const program = drillPrograms.find((p) => p.id === programId);
  const defaultMode = urlMode === "quiz" ? "quiz" : (program?.defaultMode ?? "flashcards");

  const [drillSubMode, setDrillSubMode] = useState<"flashcards" | "quiz">(defaultMode);
  const [drillWeakFocus, setDrillWeakFocus] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId>("smart");
  const [showFilters, setShowFilters] = useState(false);

  // Sync mode with URL param
  useEffect(() => {
    if (urlMode === "quiz") {
      setDrillSubMode("quiz");
    }
  }, [urlMode]);

  // Filter sections by program (godmode/custom shows all)
  const programSections = useMemo(() => {
    const ids = getSectionsForProgram(programId, sections.map((s) => s.sectionId));
    return sections.filter((s) => ids.includes(s.sectionId));
  }, [programId]);

  // Handle preset selection
  const handlePresetChange = (preset: PresetId) => {
    setActivePreset(preset);
    if (preset === "weak") {
      setDrillWeakFocus(true);
    } else {
      setDrillWeakFocus(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      {/* Top controls row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Sub-mode toggle: Flashcards | Quiz */}
        <div className="inline-flex rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-0.5">
          <button
            onClick={() => setDrillSubMode("flashcards")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              drillSubMode === "flashcards"
                ? "bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
                : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
            )}
          >
            Flashcards
          </button>
          <button
            onClick={() => setDrillSubMode("quiz")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              drillSubMode === "quiz"
                ? "bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
                : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
            )}
          >
            Quiz
          </button>
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
            showFilters
              ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
              : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:border-[var(--ifr-accent)]/50"
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {programId !== "godmode" && (
            <span className="rounded-full bg-[var(--ifr-accent)] px-1.5 py-0.5 text-xs text-white">
              1
            </span>
          )}
        </button>
      </div>

      {/* Collapsible filter panel */}
      {showFilters && (
        <div className="mb-6 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <ProgramFilter
            programId={programId}
            onProgramChange={setProgramId}
          />
        </div>
      )}

      {/* Session presets */}
      <SessionPresets activePreset={activePreset} onSelectPreset={handlePresetChange} />

      {/* Render DrillView or QuizView based on sub-mode */}
      {drillSubMode === "flashcards" ? (
        <DrillView sections={programSections} focusWeak={drillWeakFocus} />
      ) : (
        <QuizView sections={programSections} programId={programId} />
      )}
    </div>
  );
}

export default function DrillPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--ifr-accent)] border-t-transparent" />
        </div>
      </div>
    }>
      <DrillPageContent />
    </Suspense>
  );
}
