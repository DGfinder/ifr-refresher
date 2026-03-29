import type { DrillFilter } from "./drill";

export type ProgramId = "ipc_oral" | "airline_panel" | "quick_fire_numbers" | "god_mode" | "cheat_sheet";

export interface StudyProgram {
  id: ProgramId;
  name: string;
  description: string;
  recommendedUse: string;
  filter: DrillFilter;
}
