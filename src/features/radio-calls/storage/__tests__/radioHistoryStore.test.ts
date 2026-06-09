import { describe, it, expect } from "vitest";
import {
  RADIO_HISTORY_SCHEMA_TAG,
  getBestForScenario,
  getLastForScenario,
  migrateRadioHistory,
  type RadioHistoryEntry,
} from "@/features/radio-calls/storage/radioHistoryStore";

const makeEntry = (overrides: Partial<RadioHistoryEntry> = {}): RadioHistoryEntry => ({
  scenarioId: "scenario-a",
  completedAt: "2026-06-09T10:00:00Z",
  percentage: 80,
  correctAnswers: 8,
  totalQuestions: 10,
  ...overrides,
});

describe("migrateRadioHistory", () => {
  it("returns [] for null / undefined", () => {
    expect(migrateRadioHistory(null)).toEqual([]);
    expect(migrateRadioHistory(undefined)).toEqual([]);
  });

  it("returns [] for malformed shapes (no envelope)", () => {
    expect(migrateRadioHistory([])).toEqual([]);
    expect(migrateRadioHistory({})).toEqual([]);
    expect(migrateRadioHistory("oops")).toEqual([]);
  });

  it("drops entries with a mismatched schemaTag", () => {
    const out = migrateRadioHistory({
      v: 1,
      schemaTag: "ifr-radio-history@99",
      entries: [makeEntry()],
    });
    expect(out).toEqual([]);
  });

  it("returns entries when schemaTag matches", () => {
    const entry = makeEntry();
    const out = migrateRadioHistory({
      v: 1,
      schemaTag: RADIO_HISTORY_SCHEMA_TAG,
      entries: [entry],
    });
    expect(out).toEqual([entry]);
  });

  it("silently filters corrupt entries from a valid envelope", () => {
    const good = makeEntry();
    const out = migrateRadioHistory({
      v: 1,
      schemaTag: RADIO_HISTORY_SCHEMA_TAG,
      entries: [good, { scenarioId: "x" }, null, "stringy"],
    });
    expect(out).toEqual([good]);
  });

  it("caps the returned entries to 50", () => {
    const entries = Array.from({ length: 60 }, (_, i) =>
      makeEntry({ scenarioId: `s-${i}` }),
    );
    const out = migrateRadioHistory({
      v: 1,
      schemaTag: RADIO_HISTORY_SCHEMA_TAG,
      entries,
    });
    expect(out).toHaveLength(50);
  });
});

describe("getBestForScenario", () => {
  it("returns null when no entries match", () => {
    expect(getBestForScenario([], "missing")).toBeNull();
  });

  it("returns the highest-percentage entry for the matching scenario", () => {
    const entries = [
      makeEntry({ scenarioId: "a", percentage: 60 }),
      makeEntry({ scenarioId: "a", percentage: 90 }),
      makeEntry({ scenarioId: "a", percentage: 75 }),
      makeEntry({ scenarioId: "b", percentage: 100 }),
    ];
    const best = getBestForScenario(entries, "a");
    expect(best?.percentage).toBe(90);
  });
});

describe("getLastForScenario", () => {
  it("returns null when no entries match", () => {
    expect(getLastForScenario([], "missing")).toBeNull();
  });

  it("returns the first matching entry (history is stored newest-first)", () => {
    const entries = [
      makeEntry({ scenarioId: "a", completedAt: "2026-06-09" }),
      makeEntry({ scenarioId: "a", completedAt: "2026-06-08" }),
    ];
    const last = getLastForScenario(entries, "a");
    expect(last?.completedAt).toBe("2026-06-09");
  });
});
