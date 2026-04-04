import type { ProgramId, StudyProgram } from "@/types/programs";

export const STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: "cheat_sheet",
    name: "Cheat Sheet",
    description: "Questions from the We Fly Planes IFR Cheat Sheet v7.1 — the trusted community reference.",
    recommendedUse: "Best starting point. Covers the full cheat sheet: licensing, recency, equipment, fuel, alternates, en route, holding and approaches.",
    filter: {
      kinds: ["legacy_qa"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "ipc_oral",
    name: "IPC Oral",
    description: "Law, procedures and traps across all sections — the full IPC oral mix.",
    recommendedUse: "Run this in the days leading up to your IPC. Broad coverage across law, minima, alternates and approaches.",
    filter: {
      kinds: ["ipc", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "god_mode",
    name: "God Mode",
    description: "Everything — all sections, all levels, all question types.",
    recommendedUse: "Use when you want full-spectrum coverage including airline-level questions.",
    filter: {
      kinds: ["ipc", "airline", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced", "airline"],
    },
  },
];

export function getProgramById(id: ProgramId): StudyProgram | undefined {
  return STUDY_PROGRAMS.find((p) => p.id === id);
}
