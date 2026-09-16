import type { DrillFilter } from "@/features/drill";

export type ProgramId = "cheat_sheet" | "instrument_rating" | "ipc_oral";

export interface StudyProgram {
  id: ProgramId;
  name: string;
  description: string;
  recommendedUse: string;
  filter: DrillFilter;
}
