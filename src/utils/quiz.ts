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
 * Build quiz questions from drill questions with distractors.
 *
 * Distractor priority (per question):
 *   1. Pre-authored distractors on the DrillQuestion (exact 3) — highest quality
 *   2. Module-scoped pool: other answers from the same module
 *   3. Section-scoped pool: other answers from the same section
 *   4. Global pool: all unique answers across all questions
 */
export function buildQuizQuestions(
  drillQuestions: DrillQuestion[],
  limit: number = 10
): QuizQuestion[] {
  if (drillQuestions.length === 0) return [];

  // Pre-build answer pools grouped by module and section (unique answers only)
  const answersByModule: Record<string, Set<string>> = {};
  const answersBySection: Record<string, Set<string>> = {};

  for (const q of drillQuestions) {
    const moduleKey = `${q.sectionId}::${q.moduleId}`;
    if (!answersByModule[moduleKey]) answersByModule[moduleKey] = new Set();
    answersByModule[moduleKey].add(q.answer);

    if (!answersBySection[q.sectionId]) answersBySection[q.sectionId] = new Set();
    answersBySection[q.sectionId].add(q.answer);
  }

  // Global unique answer pool (fallback)
  const allAnswers = [...new Set(drillQuestions.map((q) => q.answer))];

  // Shuffle and limit questions
  const selectedQuestions = shuffle(drillQuestions).slice(0, limit);

  return selectedQuestions.map((dq) => {
    const correctAnswer = dq.answer;
    let distractors: string[];

    // Priority 1: pre-authored distractors
    if (dq.distractors && dq.distractors.length === 3) {
      distractors = dq.distractors;
    } else {
      // Priority 2: module-scoped pool
      const moduleKey = `${dq.sectionId}::${dq.moduleId}`;
      let pool = [...(answersByModule[moduleKey] || [])].filter((a) => a !== correctAnswer);

      // Priority 3: section-scoped pool (if module didn't have enough)
      if (pool.length < 3) {
        const sectionPool = [...(answersBySection[dq.sectionId] || [])].filter(
          (a) => a !== correctAnswer && !pool.includes(a)
        );
        pool = [...pool, ...sectionPool];
      }

      // Priority 4: global pool (last resort)
      if (pool.length < 3) {
        const globalPool = allAnswers.filter((a) => a !== correctAnswer && !pool.includes(a));
        pool = [...pool, ...globalPool];
      }

      distractors = shuffle(pool).slice(0, 3);

      // Absolute fallback: pad if somehow still empty
      while (distractors.length < 3) {
        distractors.push(`Option ${distractors.length + 2}`);
      }
    }

    // Place correct answer + distractors in random positions
    const allOptions = shuffle([correctAnswer, ...distractors]);
    const correctIndex = allOptions.indexOf(correctAnswer);
    const correctOptionId = OPTION_IDS[correctIndex];

    const options: QuizOption[] = allOptions.map((text, index) => ({
      id: OPTION_IDS[index],
      text,
    }));

    return {
      id: dq.id,
      sectionId: dq.sectionId,
      moduleId: dq.moduleId,
      prompt: dq.prompt,
      correctOptionId,
      options,
    };
  });
}
