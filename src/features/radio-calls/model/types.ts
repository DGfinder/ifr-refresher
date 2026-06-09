import type { RadioOptionId, RadioScenario } from "@/content/model/radio";

export type RadioPhase = "dashboard" | "session" | "results";

export interface RadioAnswerRecord {
  questionId: string;
  selectedOptionId: RadioOptionId;
  correctOptionId: RadioOptionId;
  isCorrect: boolean;
}

export type RadioAnswerMap = Record<string, RadioAnswerRecord>;

export interface RadioResult {
  scenarioId: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  perLeg: Array<{
    legId: string;
    questionId: string;
    isCorrect: boolean;
    selectedOptionId: RadioOptionId;
    correctOptionId: RadioOptionId;
  }>;
}

export interface RadioSessionShape {
  scenario: RadioScenario;
  totalLegs: number;
  totalQuestions: number;
}
