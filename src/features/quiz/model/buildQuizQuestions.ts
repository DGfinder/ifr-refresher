import type { DrillQuestion, QuizQuestion, QuizOption, QuizOptionId } from "@/features/drill";

const OPTION_IDS: QuizOptionId[] = ["A", "B", "C", "D"];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

function normalizedOption(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * A scored quiz question must be an authored four-option MCQ. We deliberately
 * do not borrow answers from other cards: an answer that is correct elsewhere
 * is not necessarily a plausible or safe distractor for this question.
 */
/**
 * A true/false question: the answer and its single distractor are the two
 * verdicts. Some material has no plausible fourth option — a radio call either
 * includes an element or it does not — and inventing two more wrong answers to
 * reach a four-option shape would only pad the question.
 */
export function isTrueFalse(question: DrillQuestion): boolean {
  const { answer, distractors } = question;
  if (!distractors || distractors.length !== 1) return false;
  const pair = [normalizedOption(answer), normalizedOption(distractors[0]!)].sort();
  return pair[0] === "false" && pair[1] === "true";
}

export function hasValidAuthoredDistractors(question: DrillQuestion): boolean {
  const { answer, distractors } = question;
  if (!question.prompt.trim() || !answer.trim() || !distractors) return false;
  if (isTrueFalse(question)) return true;
  if (distractors.length !== 3) return false;

  const normalizedAnswer = normalizedOption(answer);
  const normalizedDistractors = distractors.map((distractor) => normalizedOption(distractor));

  return normalizedDistractors.every(Boolean)
    && !normalizedDistractors.includes(normalizedAnswer)
    && new Set(normalizedDistractors).size === 3;
}

/** Return only questions that can be presented as authored scored MCQs. */
export function getQuizEligibleQuestions(drillQuestions: DrillQuestion[]): DrillQuestion[] {
  return drillQuestions.filter(hasValidAuthoredDistractors);
}

/** Build scored quiz questions exclusively from structurally valid authored MCQs. */
export function buildQuizQuestions(
  drillQuestions: DrillQuestion[],
  limit?: number,
): QuizQuestion[] {
  const selectedQuestions = shuffle(getQuizEligibleQuestions(drillQuestions))
    .slice(0, limit ?? drillQuestions.length);

  return selectedQuestions.map((question) => {
    // Eligibility guarantees this is a non-empty, distinct set of three, or a
    // true/false pair.
    const distractors = question.distractors!;
    // True always reads first. Shuffling two verdicts gains nothing and makes
    // the reader re-check which way round they are on every question.
    const allOptions = isTrueFalse(question)
      ? ["True", "False"]
      : shuffle([question.answer, ...distractors]);
    const correctIndex = allOptions.findIndex(
      (option) => normalizedOption(option) === normalizedOption(question.answer),
    );
    const correctOptionId = OPTION_IDS[correctIndex]!;
    const options: QuizOption[] = allOptions.map((text, index) => ({
      id: OPTION_IDS[index]!,
      text,
    }));

    return {
      id: question.id,
      sectionId: question.sectionId,
      moduleId: question.moduleId,
      prompt: question.prompt,
      correctOptionId,
      options,
    };
  });
}
