import type { DrillQuestion, QuizQuestion, QuizOption, QuizOptionId } from "@/types/drill";

const OPTION_IDS: QuizOptionId[] = ["A", "B", "C", "D"];

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build quiz questions from drill questions with distractors
 */
export function buildQuizQuestions(
  drillQuestions: DrillQuestion[],
  limit: number = 10
): QuizQuestion[] {
  if (drillQuestions.length === 0) return [];

  // Group answers by section for better distractor selection
  const answersBySection: Record<string, string[]> = {};
  for (const q of drillQuestions) {
    if (!answersBySection[q.sectionId]) {
      answersBySection[q.sectionId] = [];
    }
    answersBySection[q.sectionId].push(q.answer);
  }

  // Get all unique answers for fallback distractors
  const allAnswers = [...new Set(drillQuestions.map((q) => q.answer))];

  // Shuffle and limit questions
  const selectedQuestions = shuffle(drillQuestions).slice(0, limit);

  return selectedQuestions.map((dq) => {
    const correctAnswer = dq.answer;

    // Get potential distractors from same section (excluding correct answer)
    let distractorPool = (answersBySection[dq.sectionId] || []).filter(
      (a) => a !== correctAnswer
    );

    // If not enough distractors from same section, use all answers
    if (distractorPool.length < 3) {
      distractorPool = allAnswers.filter((a) => a !== correctAnswer);
    }

    // Shuffle and pick 3 distractors
    const shuffledDistractors = shuffle(distractorPool);
    const distractors = shuffledDistractors.slice(0, 3);

    // If still not enough distractors, pad with generic ones
    while (distractors.length < 3) {
      distractors.push(`Option ${distractors.length + 2}`);
    }

    // Combine correct answer with distractors and shuffle
    const allOptions = shuffle([correctAnswer, ...distractors]);

    // Find which position the correct answer ended up in
    const correctIndex = allOptions.indexOf(correctAnswer);
    const correctOptionId = OPTION_IDS[correctIndex];

    // Build options array
    const options: QuizOption[] = allOptions.map((text, index) => ({
      id: OPTION_IDS[index],
      text,
    }));

    return {
      id: dq.id,
      sectionId: dq.sectionId,
      moduleId: dq.moduleId,
      prompt: dq.question,
      correctOptionId,
      options,
    };
  });
}
