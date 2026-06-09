import type { RadioOptionId, RadioScenario } from "@/content/model/radio";

export type RadioPhase = "dashboard" | "session" | "results";

/**
 * One persisted answer entry. Tagged with `kind` so all three challenge
 * types live in the same map keyed by the challenge id.
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
    }
  | {
      kind: "spoken";
      questionId: string;
      /** What the learner said / typed, exactly as captured. */
      transcript: string;
      /** Labels of elements present in the transcript. */
      hitElementLabels: string[];
      /** Labels of required elements missed. */
      missedRequiredLabels: string[];
      /** Labels of optional elements missed. */
      missedOptionalLabels: string[];
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
    /** Which challenge kind this leg used — for the results screen label. */
    kind: "mcq" | "readback" | "spoken";
  }>;
}

export interface RadioSessionShape {
  scenario: RadioScenario;
  totalLegs: number;
  totalQuestions: number;
}
