"use client";

import { useState, Suspense } from "react";
import { SessionPresets, type PresetId } from "@/components/SessionPresets";
import { DrillView } from "@/components/DrillView";
import { ProgramSelector } from "@/components/ProgramSelector";
import { sections } from "@/data/sections";
import type { ProgramId } from "@/types/programs";

function DrillPageContent() {
  const [programId, setProgramId] = useState<ProgramId>("ipc_oral");
  const [drillWeakFocus, setDrillWeakFocus] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId>("smart");

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
      {/* Program selector - always visible at top */}
      <ProgramSelector value={programId} onChange={setProgramId} />

      {/* Session presets */}
      <div className="mb-6">
        <SessionPresets activePreset={activePreset} onSelectPreset={handlePresetChange} />
      </div>

      {/* Flashcard drill view */}
      <DrillView sections={sections} programId={programId} focusWeak={drillWeakFocus} />
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
