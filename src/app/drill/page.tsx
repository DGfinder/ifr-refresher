"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SessionPresets, type PresetId } from "@/components/SessionPresets";
import { DrillView } from "@/components/DrillView";
import { QuizView } from "@/components/QuizView";
import { ProgramTabs } from "@/components/ProgramTabs";
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
      {/* Program tabs - always visible at top */}
      <ProgramTabs programId={programId} onProgramChange={setProgramId} />

      {/* Mode toggle + Session presets row */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
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

        {/* Session presets inline */}
        <SessionPresets activePreset={activePreset} onSelectPreset={handlePresetChange} />
      </div>

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
