"use client";

import { useState, useMemo } from "react";
import { GoalIndicator } from "@/components/GoalIndicator";
import { SessionPresets, type PresetId } from "@/components/SessionPresets";
import { DrillView } from "@/components/DrillView";
import { QuizView } from "@/components/QuizView";
import { sections } from "@/data/sections";
import { getSectionsForProgram, drillPrograms } from "@/data/drillPrograms";
import { useProgram } from "@/contexts/ProgramContext";
import { cn } from "@/lib/utils";

export default function DrillPage() {
  const { programId } = useProgram();

  // Get program defaults
  const program = drillPrograms.find((p) => p.id === programId);
  const defaultMode = program?.defaultMode ?? "flashcards";

  const [drillSubMode, setDrillSubMode] = useState<"flashcards" | "quiz">(defaultMode);
  const [drillWeakFocus, setDrillWeakFocus] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId>("smart");

  // Filter sections by program
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
      <GoalIndicator />

      {/* Sub-mode toggle: Flashcards | Quiz */}
      <div className="mb-6 flex justify-center">
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
      </div>

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
