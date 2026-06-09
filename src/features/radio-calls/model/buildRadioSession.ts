import type { RadioMCQ, RadioOptionId, RadioScenario } from "@/content/model/radio";
import type { RadioAnswerMap, RadioAnswerRecord, RadioResult, RadioSessionShape } from "./types";

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

export interface RadioAnswerOutcome {
  isCorrect: boolean;
  correctOptionId: RadioOptionId;
}

export function evaluateRadioMcq(
  question: RadioMCQ,
  optionId: RadioOptionId,
): RadioAnswerOutcome {
  return {
    isCorrect: optionId === question.correctOptionId,
    correctOptionId: question.correctOptionId,
  };
}

export function buildRadioAnswer(
  question: RadioMCQ,
  optionId: RadioOptionId,
): RadioAnswerRecord {
  return {
    questionId: question.id,
    selectedOptionId: optionId,
    correctOptionId: question.correctOptionId,
    isCorrect: optionId === question.correctOptionId,
  };
}

export function isRadioSessionOver(currentLegIndex: number, totalLegs: number): boolean {
  return currentLegIndex + 1 >= totalLegs;
}

/**
 * Build the final per-leg breakdown once the learner reaches the end.
 * Legs without a question are skipped in the breakdown (informational only).
 */
export function buildRadioResult(
  scenario: RadioScenario,
  answers: RadioAnswerMap,
): RadioResult {
  const perLeg: RadioResult["perLeg"] = [];
  let correct = 0;

  for (const leg of scenario.legs) {
    if (!leg.question) continue;
    const answer = answers[leg.question.id];
    if (!answer) continue;
    if (answer.isCorrect) correct += 1;
    perLeg.push({
      legId: leg.id,
      questionId: leg.question.id,
      isCorrect: answer.isCorrect,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: answer.correctOptionId,
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
