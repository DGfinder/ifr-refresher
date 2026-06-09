import type { DrillQuestion, QuizQuestion, QuizOptionId } from "@/features/drill";
import { buildQuizQuestions } from "@/features/quiz/model/buildQuizQuestions";
import { calculatePoints } from "@/features/quiz/model/scoring";
import type {
  QuizAnswer,
  QuizGameMode,
  QuizResult,
  QuizSessionConfig,
} from "@/features/quiz/model/types";

const CHALLENGE_STARTING_LIVES = 3;
const NON_CHALLENGE_LIVES_SENTINEL = 999;
const DEFAULT_TIMED_SECONDS = 30;

export interface SessionStart {
  questions: QuizQuestion[];
  startingLives: number;
  startingTimer: number;
}

/**
 * Pick and order the questions for a new session, plus the initial timer/lives.
 * Returns `null` when there are no questions to play, so the hook can avoid
 * transitioning into a session phase with an empty queue.
 */
export function buildSessionStart(
  drillQuestions: DrillQuestion[],
  config: QuizSessionConfig,
): SessionStart | null {
  const limit = config.questionCount === "all" ? undefined : config.questionCount;
  const questions = buildQuizQuestions(drillQuestions, limit);
  if (questions.length === 0) return null;

  return {
    questions,
    startingLives: config.mode === "challenge" ? CHALLENGE_STARTING_LIVES : NON_CHALLENGE_LIVES_SENTINEL,
    startingTimer: config.mode === "timed" ? (config.timePerQuestion ?? DEFAULT_TIMED_SECONDS) : 0,
  };
}

export interface AnswerOutcome {
  isCorrect: boolean;
  newStreak: number;
  pointsEarned: number;
  livesDelta: number;
}

/**
 * Pure scoring decision for a single answer. Does not touch React state.
 */
export function evaluateAnswer(
  question: QuizQuestion,
  optionId: QuizOptionId,
  prev: { streak: number; mode: QuizGameMode; timeSpentMs: number },
): AnswerOutcome {
  const isCorrect = optionId === question.correctOptionId;
  const newStreak = isCorrect ? prev.streak + 1 : 0;
  const pointsEarned = calculatePoints({
    isCorrect,
    streak: newStreak,
    timeSpentMs: prev.timeSpentMs,
    mode: prev.mode,
  });
  const livesDelta = prev.mode === "challenge" && !isCorrect ? -1 : 0;
  return { isCorrect, newStreak, pointsEarned, livesDelta };
}

/**
 * Construct the persisted record for a single answer (selected or skipped).
 */
export function buildAnswer(
  question: QuizQuestion,
  optionId: QuizOptionId | null,
  meta: { timeSpentMs: number; skipped: boolean; flagged: boolean },
): QuizAnswer {
  const isCorrect = optionId !== null && optionId === question.correctOptionId;
  return {
    questionId: question.id,
    selectedOptionId: optionId,
    correctOptionId: question.correctOptionId,
    isCorrect,
    timeSpent: meta.timeSpentMs,
    skipped: meta.skipped,
    flagged: meta.flagged,
  };
}

/**
 * Returns the timer reset value to apply when moving to the next question.
 * Only timed mode has a per-question countdown.
 */
export function timerForNextQuestion(config: QuizSessionConfig): number {
  if (config.mode !== "timed") return 0;
  return config.timePerQuestion ?? DEFAULT_TIMED_SECONDS;
}

/**
 * Decide whether the session should end after applying the supplied delta.
 */
export function isSessionOver(input: {
  mode: QuizGameMode;
  currentIndex: number;
  totalQuestions: number;
  lives: number;
}): boolean {
  if (input.mode === "challenge" && input.lives <= 0) return true;
  return input.currentIndex + 1 >= input.totalQuestions;
}

/**
 * Aggregate the per-section breakdown for the results screen.
 */
export function buildSectionBreakdown(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): Record<string, { correct: number; total: number }> {
  const out: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const bucket = out[q.sectionId] ?? { correct: 0, total: 0 };
    bucket.total += 1;
    const answer = answers.find((a) => a.questionId === q.id);
    if (answer?.isCorrect) bucket.correct += 1;
    out[q.sectionId] = bucket;
  }
  return out;
}

/**
 * Build the final QuizResult once the session ends.
 */
export function buildSessionResult(input: {
  config: QuizSessionConfig;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number;
  maxStreak: number;
  sessionStartedAtMs: number;
  nowMs?: number;
}): QuizResult {
  const now = input.nowMs ?? Date.now();
  const correctCount = input.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = input.answers.filter((a) => !a.isCorrect && !a.skipped).length;
  const skippedCount = input.answers.filter((a) => a.skipped).length;

  return {
    id: `quiz-${now}`,
    mode: input.config.mode,
    completedAt: new Date(now).toISOString(),
    totalQuestions: input.questions.length,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    skippedAnswers: skippedCount,
    score: input.score,
    maxStreak: input.maxStreak,
    timeSpent: now - input.sessionStartedAtMs,
    answers: input.answers,
    bySection: buildSectionBreakdown(input.questions, input.answers),
  };
}
