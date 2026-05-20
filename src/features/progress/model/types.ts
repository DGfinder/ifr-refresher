export type ModuleStatus = "not-started" | "in-progress" | "completed";

export interface ProgressState {
  [moduleKey: string]: ModuleStatus; // Key: "sectionId:moduleId"
}
