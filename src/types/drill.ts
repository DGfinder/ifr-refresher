export interface DrillQuestion {
  id: string;                    // "sectionId:moduleId:qa-index"
  sectionId: string;
  sectionTitle: string;
  moduleId: string;
  moduleTitle: string;
  question: string;
  answer: string;
  level?: "core" | "advanced" | "airline";
  tags?: string[];
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
export type DrillProgramId = "ipc" | "airline" | "godmode" | "custom";

export interface DrillProgram {
  id: DrillProgramId;
  label: string;
  description: string;
  sectionIds: string[];
  defaultMode: "flashcards" | "quiz";
}
