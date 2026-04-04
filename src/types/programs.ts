import type { DrillFilter } from "./drill";

export type ProgramId = "cheat_sheet" | "ipc_oral" | "god_mode";

export interface StudyProgram {
  id: ProgramId;
  name: string;
  description: string;
  recommendedUse: string;
  filter: DrillFilter;
}
