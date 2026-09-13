import type { ProgramId, StudyProgram } from "@/features/programs/model/types";

export const STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: "cheat_sheet",
    name: "Quick Study",
    description: "A short, cheat-sheet scoped review of core IFR law and procedures.",
    recommendedUse: "Use for a quick refresher before a flight or whenever you have a few minutes.",
    filter: {
      kinds: ["legacy_qa"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "instrument_rating",
    name: "Instrument Rating",
    description: "Broad IFR study across regulations, procedures, equipment, weather, approaches and numerics.",
    recommendedUse: "Use when you want to work through the main instrument-rating topics in one pathway.",
    filter: {
      sectionIds: [
        "administrative-part61",
        "airspace-atc-services",
        "fuel-alternates",
        "departure",
        "en-route",
        "holding",
        "approaches",
        "performance-gradient",
        "miscellaneous-technical",
        "quick-fire-numbers",
        "casa-traps-gotchas",
        "cheat-sheet",
      ],
      kinds: ["ipc", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "ipc_oral",
    name: "IPC Prep",
    description: "A question-led review of IFR law, procedures, numerics and common traps.",
    recommendedUse: "Use to organise a focused review around IPC-style questions.",
    filter: {
      kinds: ["ipc", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "airline_transition",
    name: "Airline Transition",
    description: "Advanced IFR operations, airline scenarios and panel-style questions for a transition into airline operations.",
    recommendedUse: "Use when preparing to discuss airline operations alongside your broader IFR knowledge.",
    filter: {
      sectionIds: ["advanced-ifr-regs-airline-ops", "airline-scenarios-panel", "quick-fire-numbers"],
      kinds: ["airline", "ipc", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced", "airline"],
    },
  },
  {
    id: "god_mode",
    name: "Comprehensive Review",
    description: "A broad review across all available sections, levels and question types.",
    recommendedUse: "Use for an end-to-end review when you want to revisit the full library.",
    filter: {
      kinds: ["ipc", "airline", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced", "airline"],
    },
  },
];

export function getProgramById(id: ProgramId): StudyProgram | undefined {
  return STUDY_PROGRAMS.find((p) => p.id === id);
}
