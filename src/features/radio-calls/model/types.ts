import type { RadioOptionId, RadioScenario } from "@/content/model/radio";

export type RadioPhase = "dashboard" | "session" | "results";

/**
 * One persisted answer entry. Tagged with `kind` so MCQ and readback
 * answers can live in the same map keyed by the challenge id.
 */
export type RadioAnswerRecord =
  | {
      kind: "mcq";
      /** The challenge id this answer belongs to (formerly `questionId`). */
      questionId: string;
      selectedOptionId: RadioOptionId;
      correctOptionId: RadioOptionId;
      isCorrect: boolean;
    }
  | {
      kind: "readback";
      questionId: string;
      selectedChipIds: string[];
      requiredChipIds: string[];
      isCorrect: boolean;
    };

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
    /** "mcq" or "readback" — for the results screen to show the right label. */
    kind: "mcq" | "readback";
  }>;
}

export interface RadioSessionShape {
  scenario: RadioScenario;
  totalLegs: number;
  totalQuestions: number;
}
