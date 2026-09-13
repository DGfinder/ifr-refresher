import type { DrillProgram, DrillProgramId } from "@/features/drill";

export const drillPrograms: DrillProgram[] = [
  {
    id: "ipc",
    label: "IPC / Recency",
    description: "Core regulatory, altimetry, procedures, and numerics for IPC preparation.",
    sectionIds: ["administrative-part61", "en-route", "approaches", "quick-fire-numbers"],
    defaultMode: "flashcards",
  },
  {
    id: "instrument_rating",
    label: "Instrument Rating",
    description: "Broad IFR flashcards across regulations, procedures, equipment, approaches, and numerics.",
    sectionIds: ["administrative-part61", "airspace-atc-services", "fuel-alternates", "departure", "en-route", "holding", "approaches", "performance-gradient", "miscellaneous-technical", "quick-fire-numbers", "casa-traps-gotchas", "cheat-sheet"],
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
    id: "airline_transition",
    label: "Airline Transition",
    description: "Advanced IFR operations, airline scenarios, and panel-style discussion topics.",
    sectionIds: ["advanced-ifr-regs-airline-ops", "airline-scenarios-panel", "quick-fire-numbers"],
    defaultMode: "quiz",
  },
  {
    id: "godmode",
    label: "Comprehensive Review",
    description: "All sections and question types for a broad review of the available library.",
    sectionIds: [],
    defaultMode: "flashcards",
  },
  {
    id: "cheat_sheet",
    label: "Quick Study",
    description: "Core IFR flashcards — licensing, recency, equipment, fuel, alternates, en route, holding and approaches.",
    sectionIds: ["cheat-sheet"],
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
