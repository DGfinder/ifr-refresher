import type { ProgramId, StudyProgram } from "@/types/programs";

export const STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: "cheat_sheet",
    name: "Quick Study",
    description: "Core IFR law and procedures — licensing, recency, equipment, fuel, alternates, en route, holding and approaches.",
    recommendedUse: "Default starting point. 10 minutes before a flight review or whenever you need a quick refresher.",
    filter: {
      kinds: ["legacy_qa"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "ipc_oral",
    name: "IPC Prep",
    description: "Full IPC oral preparation — core content plus law, procedures and traps across all sections.",
    recommendedUse: "Use in the days leading up to your IPC. Broader coverage across law, minima, alternates and approaches.",
    filter: {
      kinds: ["ipc", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced"],
    },
  },
  {
    id: "god_mode",
    name: "God Mode",
    description: "Everything — all sections, all levels, all question types including airline.",
    recommendedUse: "Full-spectrum coverage when you want to go deep.",
    filter: {
      kinds: ["ipc", "airline", "legacy_qa", "trap", "numeric"],
      levels: ["core", "advanced", "airline"],
    },
  },
];

export function getProgramById(id: ProgramId): StudyProgram | undefined {
  return STUDY_PROGRAMS.find((p) => p.id === id);
}
