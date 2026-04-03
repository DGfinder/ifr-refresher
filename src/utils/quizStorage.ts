import type { QuizProgress, QuizResult, QuizAnswer } from "@/types/quiz";
import { createInitialProgress } from "@/types/quiz";
import { storage } from "@/lib/storage";

const STORAGE_KEY = "ifrQuizProgress";
const MAX_HISTORY = 50;

/**
 * Get current date in YYYY-MM-DD format
 */
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if a date string is yesterday
 */
function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Check if a date string is today
 */
function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

/**
 * Load quiz progress from IndexedDB
 */
export async function loadQuizProgress(): Promise<QuizProgress> {
  try {
    const stored = await storage.get<QuizProgress>(STORAGE_KEY);
    if (!stored) {
      return createInitialProgress();
    }

    // Validate and migrate if needed
    return {
      history: Array.isArray(stored.history) ? stored.history : [],
      bestScores: stored.bestScores ?? createInitialProgress().bestScores,
      totalStats: stored.totalStats ?? createInitialProgress().totalStats,
      dailyStreak: stored.dailyStreak ?? createInitialProgress().dailyStreak,
      masteredQuestions: Array.isArray(stored.masteredQuestions) ? stored.masteredQuestions : [],
    };
  } catch {
    return createInitialProgress();
  }
}

/**
 * Save quiz progress to IndexedDB
 */
export async function saveQuizProgress(progress: QuizProgress): Promise<void> {
  try {
    await storage.set(STORAGE_KEY, progress);
  } catch (e) {
    console.error("Failed to save quiz progress:", e);
  }
}

/**
 * Add a completed quiz result and update stats
 */
export async function addQuizResult(result: QuizResult): Promise<QuizProgress> {
  const progress = await loadQuizProgress();
  const today = getToday();

  // Add to history (keep last 50)
  progress.history = [result, ...progress.history].slice(0, MAX_HISTORY);

  // Update best score for this mode
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  if (percentage > (progress.bestScores[result.mode] ?? 0)) {
    progress.bestScores[result.mode] = percentage;
  }

  // Update total stats
  progress.totalStats.quizzesCompleted += 1;
  progress.totalStats.questionsAnswered += result.totalQuestions;
  progress.totalStats.correctAnswers += result.correctAnswers;
  progress.totalStats.totalTimeSpent += result.timeSpent;

  // Update daily streak
  if (!isToday(progress.dailyStreak.lastDate)) {
    if (isYesterday(progress.dailyStreak.lastDate)) {
      // Continuing streak
      progress.dailyStreak.current += 1;
    } else {
      // Streak broken, start fresh
      progress.dailyStreak.current = 1;
    }
    progress.dailyStreak.lastDate = today;

    // Update longest streak
    if (progress.dailyStreak.current > progress.dailyStreak.longest) {
      progress.dailyStreak.longest = progress.dailyStreak.current;
    }
  }

  // Update mastered questions (answered correctly 3+ times)
  updateMasteredQuestions(progress, result.answers);

  await saveQuizProgress(progress);
  return progress;
}

/**
 * Track which questions have been mastered
 */
function updateMasteredQuestions(progress: QuizProgress, answers: QuizAnswer[]): void {
  // Count correct answers per question across all history
  const correctCounts: Record<string, number> = {};

  for (const result of progress.history) {
    for (const answer of result.answers) {
      if (answer.isCorrect) {
        correctCounts[answer.questionId] = (correctCounts[answer.questionId] ?? 0) + 1;
      }
    }
  }

  // Also count the new answers
  for (const answer of answers) {
    if (answer.isCorrect) {
      correctCounts[answer.questionId] = (correctCounts[answer.questionId] ?? 0) + 1;
    }
  }

  // Find questions answered correctly 3+ times
  const mastered = Object.entries(correctCounts)
    .filter(([, count]) => count >= 3)
    .map(([id]) => id);

  progress.masteredQuestions = mastered;
}

/**
 * Get the last quiz result
 */
export async function getLastQuizResult(): Promise<QuizResult | null> {
  const progress = await loadQuizProgress();
  return progress.history[0] ?? null;
}

/**
 * Get statistics summary for dashboard
 */
export async function getQuizStats(): Promise<{
  lastScore: number | null;
  bestScore: number;
  dailyStreak: number;
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  averageScore: number;
}> {
  const progress = await loadQuizProgress();
  const lastResult = progress.history[0];

  const lastScore = lastResult
    ? Math.round((lastResult.correctAnswers / lastResult.totalQuestions) * 100)
    : null;

  const bestScore = Math.max(0, ...Object.values(progress.bestScores));

  const averageScore = progress.totalStats.questionsAnswered > 0
    ? Math.round((progress.totalStats.correctAnswers / progress.totalStats.questionsAnswered) * 100)
    : 0;

  return {
    lastScore,
    bestScore,
    dailyStreak: progress.dailyStreak.current,
    totalQuizzes: progress.totalStats.quizzesCompleted,
    totalCorrect: progress.totalStats.correctAnswers,
    totalQuestions: progress.totalStats.questionsAnswered,
    averageScore,
  };
}

/**
 * Get recent quiz history for display
 */
export async function getRecentHistory(limit = 5): Promise<Array<{
  mode: string;
  correct: number;
  total: number;
  date: string;
}>> {
  const progress = await loadQuizProgress();

  return progress.history.slice(0, limit).map((result) => ({
    mode: result.mode,
    correct: result.correctAnswers,
    total: result.totalQuestions,
    date: new Date(result.completedAt).toLocaleDateString(),
  }));
}

/**
 * Clear all quiz progress (for testing/reset)
 */
export async function clearQuizProgress(): Promise<void> {
  await storage.del(STORAGE_KEY);
}
