import { storage } from "@/platform/storage/idbStorage";

const STORAGE_KEY = "ifrRadioDrillHistory";

/**
 * Bumped if `RadioDrillAttempt` shape changes incompatibly. Entries with a
 * non-matching tag are dropped on load (clean upgrade — no migration UI).
 */
export const RADIO_DRILL_HISTORY_SCHEMA_TAG = "ifr-radio-drill-history@1";

/** Cap to keep storage bounded — 5000 attempts is hundreds of full sessions. */
const MAX_ATTEMPTS = 5000;

export interface RadioDrillAttempt {
  drillId: string;
  attemptedAt: string;
  isCorrect: boolean;
}

interface RadioDrillHistoryEnvelope {
  v: 1;
  schemaTag: string;
  attempts: RadioDrillAttempt[];
}

function isEnvelope(value: unknown): value is RadioDrillHistoryEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.v === 1 && typeof v.schemaTag === "string" && Array.isArray(v.attempts);
}

function isAttempt(value: unknown): value is RadioDrillAttempt {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.drillId === "string" &&
    typeof v.attemptedAt === "string" &&
    typeof v.isCorrect === "boolean"
  );
}

export function migrateRadioDrillHistory(raw: unknown): RadioDrillAttempt[] {
  if (!isEnvelope(raw)) return [];
  if (raw.schemaTag !== RADIO_DRILL_HISTORY_SCHEMA_TAG) return [];
  return raw.attempts.filter(isAttempt).slice(0, MAX_ATTEMPTS);
}

function wrap(attempts: RadioDrillAttempt[]): RadioDrillHistoryEnvelope {
  return {
    v: 1,
    schemaTag: RADIO_DRILL_HISTORY_SCHEMA_TAG,
    attempts: attempts.slice(0, MAX_ATTEMPTS),
  };
}

export async function loadRadioDrillHistory(): Promise<RadioDrillAttempt[]> {
  try {
    const raw = await storage.get<unknown>(STORAGE_KEY);
    return migrateRadioDrillHistory(raw);
  } catch {
    return [];
  }
}

export async function recordRadioDrillAttempt(
  drillId: string,
  isCorrect: boolean,
): Promise<RadioDrillAttempt[]> {
  const existing = await loadRadioDrillHistory();
  const attempt: RadioDrillAttempt = {
    drillId,
    attemptedAt: new Date().toISOString(),
    isCorrect,
  };
  const next = [attempt, ...existing].slice(0, MAX_ATTEMPTS);
  try {
    await storage.set(STORAGE_KEY, wrap(next));
  } catch (e) {
    console.error("Failed to save radio drill attempt:", e);
  }
  return next;
}

export async function clearRadioDrillHistory(): Promise<void> {
  await storage.del(STORAGE_KEY);
}

// ─── Selectors ────────────────────────────────────────────────────────────

export interface RadioDrillStats {
  totalAttempts: number;
  correctAttempts: number;
  /** Best consecutive-correct streak across all attempts. */
  bestStreak: number;
  /** ISO timestamp of the most recent attempt. */
  lastAttemptedAt: string | null;
  /** Whether the most recent attempt was correct. */
  lastIsCorrect: boolean | null;
}

const EMPTY_STATS: RadioDrillStats = {
  totalAttempts: 0,
  correctAttempts: 0,
  bestStreak: 0,
  lastAttemptedAt: null,
  lastIsCorrect: null,
};

/** Per-card stats. Attempts are stored newest-first; iterate oldest → newest
 * so the streak calculation matches what the learner experienced. */
export function getDrillStats(
  attempts: readonly RadioDrillAttempt[],
  drillId: string,
): RadioDrillStats {
  const forCard = attempts.filter((a) => a.drillId === drillId);
  if (forCard.length === 0) return EMPTY_STATS;

  let bestStreak = 0;
  let currentStreak = 0;
  // Iterate oldest first.
  for (let i = forCard.length - 1; i >= 0; i--) {
    const a = forCard[i]!;
    if (a.isCorrect) {
      currentStreak += 1;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  const correct = forCard.filter((a) => a.isCorrect).length;
  const newest = forCard[0]!;
  return {
    totalAttempts: forCard.length,
    correctAttempts: correct,
    bestStreak,
    lastAttemptedAt: newest.attemptedAt,
    lastIsCorrect: newest.isCorrect,
  };
}

/** Set of drill ids the learner has ever attempted (any result). */
export function getAttemptedDrillIds(
  attempts: readonly RadioDrillAttempt[],
): Set<string> {
  return new Set(attempts.map((a) => a.drillId));
}

/** Set of drill ids the learner has ever passed at least once. */
export function getPassedDrillIds(
  attempts: readonly RadioDrillAttempt[],
): Set<string> {
  const passed = new Set<string>();
  for (const a of attempts) {
    if (a.isCorrect) passed.add(a.drillId);
  }
  return passed;
}

/**
 * Most-recently-attempted drill ids, de-duplicated, newest first. Used by
 * /insights to show recent activity.
 */
export function getRecentDrillIds(
  attempts: readonly RadioDrillAttempt[],
  limit: number,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of attempts) {
    if (seen.has(a.drillId)) continue;
    seen.add(a.drillId);
    out.push(a.drillId);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Most-recently-attempted single attempts (not de-duplicated by card), newest
 * first. Powers the Drill landing's "Recent attempts" strip — the learner
 * sees the last few cards they touched with pass/fail at a glance.
 */
export function getRecentAttempts(
  attempts: readonly RadioDrillAttempt[],
  limit: number,
): RadioDrillAttempt[] {
  return attempts.slice(0, limit);
}

/**
 * Daily-attempt streak — number of consecutive calendar days (ending today
 * or yesterday) on which the learner attempted at least one drill. Returns 0
 * when there's no attempt today or yesterday so an idle account doesn't
 * keep displaying a stale streak.
 *
 * The "yesterday" grace window matches the quiz dashboard's streak so a
 * learner who drills late one night and early the next doesn't lose it.
 */
export function getDailyAttemptStreak(
  attempts: readonly RadioDrillAttempt[],
  now: Date = new Date(),
): number {
  if (attempts.length === 0) return 0;
  const days = new Set<string>();
  for (const a of attempts) {
    days.add(toLocalDateKey(new Date(a.attemptedAt)));
  }
  const today = toLocalDateKey(now);
  const yesterday = toLocalDateKey(addDays(now, -1));
  if (!days.has(today) && !days.has(yesterday)) return 0;

  let streak = 0;
  let cursor = days.has(today) ? new Date(now) : addDays(now, -1);
  while (days.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function toLocalDateKey(d: Date): string {
  // Local calendar day; matches the user's perception of "today" rather than UTC.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}
