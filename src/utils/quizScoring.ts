import { POINTS, STREAK_MULTIPLIERS } from "@/types/quiz";
import type { QuizGameMode } from "@/types/quiz";

/**
 * Get the current streak multiplier based on streak count
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return STREAK_MULTIPLIERS[10];
  if (streak >= 5) return STREAK_MULTIPLIERS[5];
  if (streak >= 3) return STREAK_MULTIPLIERS[3];
  return STREAK_MULTIPLIERS[0];
}

/**
 * Calculate time bonus points based on how fast the question was answered
 */
export function getTimeBonus(timeSpentMs: number): number {
  const seconds = timeSpentMs / 1000;
  if (seconds < 5) return POINTS.timeBonus.fast;
  if (seconds < 10) return POINTS.timeBonus.medium;
  if (seconds < 20) return POINTS.timeBonus.slow;
  return 0;
}

/**
 * Calculate points for a correct answer
 */
export function calculatePoints(options: {
  isCorrect: boolean;
  streak: number;
  timeSpentMs: number;
  mode: QuizGameMode;
}): number {
  if (!options.isCorrect) return 0;

  let points = POINTS.base;

  // Apply streak multiplier
  const multiplier = getStreakMultiplier(options.streak);
  points *= multiplier;

  // Add time bonus for timed mode
  if (options.mode === "timed") {
    points += getTimeBonus(options.timeSpentMs);
  }

  // Challenge mode has base multiplier
  if (options.mode === "challenge") {
    points *= POINTS.challengeMultiplier;
  }

  return Math.round(points);
}

/**
 * Calculate percentage score
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Get feedback message based on score percentage
 */
export function getScoreFeedback(percentage: number): {
  message: string;
  emoji: string;
  variant: "excellent" | "great" | "good" | "needsWork";
} {
  if (percentage >= 90) {
    return { message: "Excellent!", emoji: "🌟", variant: "excellent" };
  }
  if (percentage >= 80) {
    return { message: "Great job!", emoji: "🎯", variant: "great" };
  }
  if (percentage >= 70) {
    return { message: "Good work!", emoji: "👍", variant: "good" };
  }
  return { message: "Keep practicing!", emoji: "📚", variant: "needsWork" };
}

/**
 * Check if this is a streak milestone (triggers animation)
 */
export function isStreakMilestone(streak: number): boolean {
  return streak === 3 || streak === 5 || streak === 10 || streak === 15 || streak === 20;
}

/**
 * Format time in MM:SS or M:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format milliseconds to readable duration
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (mins < 60) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}
