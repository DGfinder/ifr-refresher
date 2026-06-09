import type {
  RadioChallenge,
  RadioMCQ,
  RadioOptionId,
  RadioReadback,
  RadioScenario,
  RadioSpokenCall,
} from "@/content/model/radio";
import { evaluateSpokenCall } from "./spokenMatch";
import type {
  RadioAnswerMap,
  RadioAnswerRecord,
  RadioResult,
  RadioSessionShape,
} from "./types";

/**
 * Shape a scenario for a fresh session run. Currently a deterministic walk
 * through the scripted legs; later phases may shuffle distractors or pick
 * a random scenario subset.
 */
export function buildRadioSession(scenario: RadioScenario): RadioSessionShape {
  const totalQuestions = scenario.legs.filter((leg) => leg.question !== undefined).length;
  return {
    scenario,
    totalLegs: scenario.legs.length,
    totalQuestions,
  };
}

export interface RadioMcqOutcome {
  isCorrect: boolean;
  correctOptionId: RadioOptionId;
}

export function evaluateRadioMcq(
  question: RadioMCQ,
  optionId: RadioOptionId,
): RadioMcqOutcome {
  return {
    isCorrect: optionId === question.correctOptionId,
    correctOptionId: question.correctOptionId,
  };
}

export interface RadioReadbackOutcome {
  isCorrect: boolean;
  /** Chip ids the learner missed. */
  missingIds: string[];
  /** Chip ids the learner selected that weren't required. */
  extraIds: string[];
}

/**
 * A readback is correct when the selected chips equal the required chips
 * exactly — no missing, no extras. Order is not significant.
 */
export function evaluateRadioReadback(
  readback: RadioReadback,
  selectedChipIds: readonly string[],
): RadioReadbackOutcome {
  const selected = new Set(selectedChipIds);
  const required = new Set(readback.requiredIds);
  const missingIds = readback.requiredIds.filter((id) => !selected.has(id));
  const extraIds = [...selected].filter((id) => !required.has(id));
  return {
    isCorrect: missingIds.length === 0 && extraIds.length === 0,
    missingIds,
    extraIds,
  };
}

export function buildRadioAnswer(
  question: RadioMCQ,
  optionId: RadioOptionId,
): RadioAnswerRecord {
  return {
    kind: "mcq",
    questionId: question.id,
    selectedOptionId: optionId,
    correctOptionId: question.correctOptionId,
    isCorrect: optionId === question.correctOptionId,
  };
}

export function buildRadioReadbackAnswer(
  readback: RadioReadback,
  selectedChipIds: readonly string[],
): RadioAnswerRecord {
  const outcome = evaluateRadioReadback(readback, selectedChipIds);
  return {
    kind: "readback",
    questionId: readback.id,
    selectedChipIds: [...selectedChipIds],
    requiredChipIds: [...readback.requiredIds],
    isCorrect: outcome.isCorrect,
  };
}

export function buildRadioSpokenAnswer(
  call: RadioSpokenCall,
  transcript: string,
): RadioAnswerRecord {
  const outcome = evaluateSpokenCall(call, transcript);
  return {
    kind: "spoken",
    questionId: call.id,
    transcript,
    hitElementLabels: outcome.hits.map((e) => e.label),
    missedRequiredLabels: outcome.missedRequired.map((e) => e.label),
    missedOptionalLabels: outcome.missedOptional.map((e) => e.label),
    isCorrect: outcome.isCorrect,
  };
}

export function isRadioSessionOver(currentLegIndex: number, totalLegs: number): boolean {
  return currentLegIndex + 1 >= totalLegs;
}

/**
 * Build the final per-leg breakdown once the learner reaches the end.
 * Legs without a question (or without an answer recorded for it) are skipped.
 */
export function buildRadioResult(
  scenario: RadioScenario,
  answers: RadioAnswerMap,
): RadioResult {
  const perLeg: RadioResult["perLeg"] = [];
  let correct = 0;

  for (const leg of scenario.legs) {
    const challenge: RadioChallenge | undefined = leg.question;
    if (!challenge) continue;
    const answer = answers[challenge.id];
    if (!answer) continue;
    if (answer.isCorrect) correct += 1;
    perLeg.push({
      legId: leg.id,
      questionId: challenge.id,
      isCorrect: answer.isCorrect,
      kind: challenge.kind,
    });
  }

  const totalQuestions = perLeg.length;
  const percentage = totalQuestions === 0 ? 0 : Math.round((correct / totalQuestions) * 100);

  return {
    scenarioId: scenario.scenarioId,
    totalQuestions,
    correctAnswers: correct,
    percentage,
    perLeg,
  };
}
