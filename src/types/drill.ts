export type QuestionSourceKind =
  | "ipc"
  | "airline"
  | "legacy_qa"
  | "trap"      // Reserved for future
  | "numeric"   // Reserved for future
  | "scenario"; // Reserved for future

export interface DrillQuestion {
  id: string;                    // "${sectionId}:${moduleId}:${kind}-${index}"
  sectionId: string;
  sectionTitle: string;
  moduleId: string;
  moduleTitle: string;
  prompt: string;                // The question text
  answer: string;
  /** Pre-authored distractors from QABlock. When present (3 items), used directly in quiz mode instead of pool-based selection. */
  distractors?: string[];
  kind: QuestionSourceKind;
  level?: "core" | "advanced" | "airline";
  tags?: string[];
}

export interface DrillFilter {
  kinds?: QuestionSourceKind[];
  tags?: string[];
  levels?: ("core" | "advanced" | "airline")[];
}

export type DrillRating = "got-it" | "unsure";

export interface DrillStats {
  questionId: string;
  seenCount: number;
  gotItCount: number;
  unsureCount: number;
  lastSeen: string;              // ISO timestamp
}

export type DrillState = Record<string, DrillStats>;

// Quiz types
export type QuizOptionId = "A" | "B" | "C" | "D";

export interface QuizOption {
  id: QuizOptionId;
  text: string;
}

export interface QuizQuestion {
  id: string;
  sectionId: string;
  moduleId: string;
  prompt: string;
  correctOptionId: QuizOptionId;
  options: QuizOption[];
}

export interface QuizStats {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
}

export type QuizMode = "idle" | "in-progress" | "finished";

// Drill program types
export type DrillProgramId = "ipc" | "airline" | "godmode" | "custom" | "cheat_sheet";

export interface DrillProgram {
  id: DrillProgramId;
  label: string;
  description: string;
  sectionIds: string[];
  defaultMode: "flashcards" | "quiz";
}
