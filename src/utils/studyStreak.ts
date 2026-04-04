import { storage } from '@/lib/storage';

const STREAK_KEY = 'ifrStudyStreak';

interface StreakData {
  currentStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  longestStreak: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

async function loadStreakData(): Promise<StreakData> {
  const stored = await storage.get<StreakData>(STREAK_KEY);
  return stored ?? { currentStreak: 0, lastStudyDate: '', longestStreak: 0 };
}

/**
 * Record any study activity (flashcard rating or quiz completion).
 * Idempotent within the same day.
 */
export async function recordStudyActivity(): Promise<StreakData> {
  const data = await loadStreakData();
  const today = getToday();

  if (data.lastStudyDate === today) {
    // Already recorded today — no change
    return data;
  }

  let newStreak: number;
  if (data.lastStudyDate === getYesterday()) {
    // Consecutive day — extend streak
    newStreak = data.currentStreak + 1;
  } else {
    // Gap or first time — reset
    newStreak = 1;
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    lastStudyDate: today,
    longestStreak: Math.max(newStreak, data.longestStreak),
  };

  await storage.set(STREAK_KEY, updated);
  return updated;
}

/**
 * Get current streak data without modifying it.
 */
export async function getStreakData(): Promise<StreakData> {
  return loadStreakData();
}
