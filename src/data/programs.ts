import type { ProgramId, StudyProgram } from "@/types/programs";

export const STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: "cheat_sheet",
    name: "Cheat Sheet",
    description: "127 questions from the We Fly Planes IFR Cheat Sheet v7.1.",
    recommendedUse: "Use in the days before your IPC. Licensing, recency, equipment, fuel, alternates, en route, holding and approaches — strictly from the cheat sheet, nothing else.",
    filter: {
      kinds: ["legacy_qa"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "ipc_oral",
    name: "IPC Oral",
    description: "CASA-style IFR oral questions for IPC and renewals.",
    recommendedUse: "Run this in the days leading up to your IPC. Focuses on law, minima, alternates, and approaches.",
    filter: {
      kinds: ["ipc", "legacy_qa"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "airline_panel",
    name: "Airline Panel",
    description: "Airline technical and panel-style questions.",
    recommendedUse: "Use before 121 and multi-crew interviews. Bias toward judgment, fuel, alternates, and approaches.",
    filter: {
      kinds: ["airline"],
      levels: ["advanced", "airline"],
    },
  },
  {
    id: "quick_fire_numbers",
    name: "Quick Fire Numbers",
    description: "Rapid-fire recency, minima, and numeric limits.",
    recommendedUse: "Use when you have 5–10 minutes. Focuses on hard numbers, not narratives.",
    filter: {
      kinds: ["ipc", "legacy_qa"],
    },
    // Section filtering done in hook
  },
  {
    id: "god_mode",
    name: "God Mode",
    description: "All sections, all levels, weighted by your weak areas.",
    recommendedUse: "Use when you're already comfortable with the other programs. This is full-spectrum IFR.",
    filter: {
      kinds: ["ipc", "airline", "legacy_qa"],
      levels: ["core", "advanced", "airline"],
    },
  },
];

export function getProgramById(id: ProgramId): StudyProgram | undefined {
  return STUDY_PROGRAMS.find((p) => p.id === id);
}
