import type { DrillProgram, DrillProgramId } from "@/types/drill";

export const drillPrograms: DrillProgram[] = [
  {
    id: "ipc",
    label: "IPC / Recency",
    description: "Core regulatory, altimetry, procedures, and numerics for IPC preparation.",
    sectionIds: ["administrative-part61", "en-route", "approaches", "quick-fire-numbers"],
    defaultMode: "flashcards",
  },
  {
    id: "airline",
    label: "Airline Interview",
    description: "Advanced regulations, airline scenarios, and panel discussion topics.",
    sectionIds: ["advanced-ifr-regs-airline-ops", "airline-scenarios-panel", "quick-fire-numbers"],
    defaultMode: "quiz",
  },
  {
    id: "godmode",
    label: "God Mode",
    description: "All sections, all questions. Full-system stress test.",
    sectionIds: [],
    defaultMode: "flashcards",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Select your own sections and modules.",
    sectionIds: [],
    defaultMode: "flashcards",
  },
];

export function getSectionsForProgram(programId: DrillProgramId, allSectionIds: string[]): string[] {
  const program = drillPrograms.find((p) => p.id === programId);
  if (!program || program.sectionIds.length === 0) return allSectionIds;
  return program.sectionIds;
}
