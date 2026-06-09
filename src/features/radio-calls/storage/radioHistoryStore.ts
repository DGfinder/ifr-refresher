import { storage } from "@/platform/storage/idbStorage";
import type { RadioResult } from "@/features/radio-calls/model/types";

const STORAGE_KEY = "ifrRadioHistory";

/**
 * Bumped if `RadioHistoryEntry` or `RadioResult` shape changes in a way the
 * old code can't read. Entries with a non-matching tag are dropped on load.
 */
export const RADIO_HISTORY_SCHEMA_TAG = "ifr-radio-history@1";

const MAX_HISTORY = 50;

export interface RadioHistoryEntry {
  scenarioId: string;
  completedAt: string;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface RadioHistoryEnvelope {
  v: 1;
  schemaTag: string;
  entries: RadioHistoryEntry[];
}

function isHistoryEnvelope(value: unknown): value is RadioHistoryEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.v === 1 && typeof v.schemaTag === "string" && Array.isArray(v.entries);
}

function isHistoryEntry(value: unknown): value is RadioHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.scenarioId === "string" &&
    typeof v.completedAt === "string" &&
    typeof v.percentage === "number" &&
    typeof v.correctAnswers === "number" &&
    typeof v.totalQuestions === "number"
  );
}

export function migrateRadioHistory(raw: unknown): RadioHistoryEntry[] {
  if (!isHistoryEnvelope(raw)) return [];
  if (raw.schemaTag !== RADIO_HISTORY_SCHEMA_TAG) return [];
  return raw.entries.filter(isHistoryEntry).slice(0, MAX_HISTORY);
}

function wrapEntries(entries: RadioHistoryEntry[]): RadioHistoryEnvelope {
  return {
    v: 1,
    schemaTag: RADIO_HISTORY_SCHEMA_TAG,
    entries: entries.slice(0, MAX_HISTORY),
  };
}

export async function loadRadioHistory(): Promise<RadioHistoryEntry[]> {
  try {
    const raw = await storage.get<unknown>(STORAGE_KEY);
    return migrateRadioHistory(raw);
  } catch {
    return [];
  }
}

export async function addRadioResult(result: RadioResult): Promise<RadioHistoryEntry[]> {
  const existing = await loadRadioHistory();
  const entry: RadioHistoryEntry = {
    scenarioId: result.scenarioId,
    completedAt: new Date().toISOString(),
    percentage: result.percentage,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
  };
  const next = [entry, ...existing].slice(0, MAX_HISTORY);
  try {
    await storage.set(STORAGE_KEY, wrapEntries(next));
  } catch (e) {
    console.error("Failed to save radio history:", e);
  }
  return next;
}

export async function clearRadioHistory(): Promise<void> {
  await storage.del(STORAGE_KEY);
}

/**
 * Find the best percentage achieved for a given scenario, or null if not
 * attempted.
 */
export function getBestForScenario(
  entries: RadioHistoryEntry[],
  scenarioId: string,
): RadioHistoryEntry | null {
  let best: RadioHistoryEntry | null = null;
  for (const entry of entries) {
    if (entry.scenarioId !== scenarioId) continue;
    if (!best || entry.percentage > best.percentage) best = entry;
  }
  return best;
}

/**
 * Find the most recent attempt for a given scenario, or null if not attempted.
 */
export function getLastForScenario(
  entries: RadioHistoryEntry[],
  scenarioId: string,
): RadioHistoryEntry | null {
  for (const entry of entries) {
    if (entry.scenarioId === scenarioId) return entry;
  }
  return null;
}
