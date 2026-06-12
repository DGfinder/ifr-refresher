import type { Card } from "ts-fsrs";
import { storage } from "@/platform/storage/idbStorage";

const STORAGE_KEY = "ifrRadioDrillFSRS";

/**
 * Same schema tag as the quiz/drill FSRS store (ts-fsrs@5). Bumped when the
 * ts-fsrs Card shape changes incompatibly.
 */
export const RADIO_DRILL_FSRS_SCHEMA_TAG = "ts-fsrs@5";

export interface FSRSEnvelope {
  v: 1;
  schemaTag: string;
  card: Card;
  updatedAt?: string;
}

export type RadioDrillFSRSStore = Record<string, FSRSEnvelope>;

export function wrapFSRSCard(card: Card): FSRSEnvelope {
  return {
    v: 1,
    schemaTag: RADIO_DRILL_FSRS_SCHEMA_TAG,
    card,
    updatedAt: new Date().toISOString(),
  };
}

function isEnvelope(value: unknown): value is FSRSEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === 1 &&
    typeof v.schemaTag === "string" &&
    typeof v.card === "object" &&
    v.card !== null
  );
}

/**
 * Read whatever's in storage and return a current-schema store. Entries with
 * a non-matching schemaTag are dropped (treated as new cards). Never throws —
 * corrupt entries skipped so the rest of the user's state survives.
 */
export function migrateRadioDrillFSRSStore(raw: unknown): RadioDrillFSRSStore {
  if (!raw || typeof raw !== "object") return {};
  const out: RadioDrillFSRSStore = {};
  for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!isEnvelope(entry)) continue;
    if (entry.schemaTag !== RADIO_DRILL_FSRS_SCHEMA_TAG) continue;
    out[id] = entry;
  }
  return out;
}

export async function loadRadioDrillFSRS(): Promise<RadioDrillFSRSStore> {
  try {
    const raw = await storage.get<unknown>(STORAGE_KEY);
    return migrateRadioDrillFSRSStore(raw);
  } catch {
    return {};
  }
}

export async function saveRadioDrillFSRS(store: RadioDrillFSRSStore): Promise<void> {
  try {
    await storage.set(STORAGE_KEY, store);
  } catch (e) {
    console.error("Failed to save radio drill FSRS state:", e);
  }
}

export async function clearRadioDrillFSRS(): Promise<void> {
  await storage.del(STORAGE_KEY);
}

// ─── Pure selectors (no ts-fsrs runtime needed) ──────────────────────────

/**
 * IDs of drill cards that are due for review right now. Excludes cards that
 * have never been attempted (those are "new", not "due").
 */
export function getDueDrillIds(
  store: RadioDrillFSRSStore,
  now: Date = new Date(),
): Set<string> {
  const out = new Set<string>();
  for (const [id, entry] of Object.entries(store)) {
    if (new Date(entry.card.due) <= now) out.add(id);
  }
  return out;
}

/** IDs of drill cards that have an FSRS entry (i.e. have been attempted). */
export function getScheduledDrillIds(store: RadioDrillFSRSStore): Set<string> {
  return new Set(Object.keys(store));
}

/**
 * Per-card next-review timestamp. Returns null if the card hasn't been
 * scheduled yet.
 */
export function getNextDueAt(
  store: RadioDrillFSRSStore,
  drillId: string,
): Date | null {
  const entry = store[drillId];
  if (!entry) return null;
  return new Date(entry.card.due);
}

/**
 * Categorise a drill card by FSRS state for UI badging.
 *  - "new" — never attempted.
 *  - "due" — scheduled, due time has passed.
 *  - "later" — scheduled, due in the future.
 */
export type RadioDrillSchedule = "new" | "due" | "later";

export function getScheduleState(
  store: RadioDrillFSRSStore,
  drillId: string,
  now: Date = new Date(),
): RadioDrillSchedule {
  const entry = store[drillId];
  if (!entry) return "new";
  return new Date(entry.card.due) <= now ? "due" : "later";
}
