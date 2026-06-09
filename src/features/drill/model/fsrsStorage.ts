import type { Card } from "ts-fsrs";

/**
 * Bumped whenever the ts-fsrs Card shape changes in a way we can't read.
 * Today ts-fsrs is v5; envelopes tagged with anything else are treated as
 * unreadable and the question reverts to "new" rather than crashing.
 */
export const FSRS_SCHEMA_TAG = "ts-fsrs@5";

export interface FSRSCardEnvelope {
  v: 1;
  schemaTag: string;
  card: Card;
  updatedAt?: string;
}

export type FSRSStore = Record<string, FSRSCardEnvelope>;

export function wrapCard(card: Card): FSRSCardEnvelope {
  return {
    v: 1,
    schemaTag: FSRS_SCHEMA_TAG,
    card,
    updatedAt: new Date().toISOString(),
  };
}

function isEnvelope(value: unknown): value is FSRSCardEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.v === 1 && typeof v.schemaTag === "string" && typeof v.card === "object" && v.card !== null;
}

function isLegacyRawCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  // A raw Card has these three concrete fields; a future-format envelope won't.
  return "due" in v && "state" in v && "stability" in v;
}

/**
 * Reads whatever shape was in storage and returns a current-schema store.
 *
 * - v1 envelope with matching schemaTag → kept as-is.
 * - v1 envelope with different schemaTag → entry dropped (treat as new card).
 * - Legacy raw Card → wrapped in a v1 envelope.
 * - Anything else → entry dropped.
 *
 * The function never throws; corrupt entries are skipped so the rest of the
 * user's FSRS state survives.
 */
export function migrateFSRSStore(raw: unknown): FSRSStore {
  if (!raw || typeof raw !== "object") return {};
  const out: FSRSStore = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isEnvelope(value)) {
      if (value.schemaTag === FSRS_SCHEMA_TAG) {
        out[key] = value;
      }
      // schemaTag mismatch → drop silently
      continue;
    }
    if (isLegacyRawCard(value)) {
      out[key] = {
        v: 1,
        schemaTag: FSRS_SCHEMA_TAG,
        card: value,
      };
    }
    // anything else → drop
  }
  return out;
}
