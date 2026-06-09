import { describe, it, expect } from "vitest";
import {
  getAttemptedDrillIds,
  getDrillStats,
  getPassedDrillIds,
  getRecentDrillIds,
  migrateRadioDrillHistory,
  RADIO_DRILL_HISTORY_SCHEMA_TAG,
  type RadioDrillAttempt,
} from "@/features/radio-calls/storage/radioDrillStore";

const newer = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

const attempts: RadioDrillAttempt[] = [
  // newest first
  { drillId: "d1", attemptedAt: newer(0), isCorrect: true },
  { drillId: "d2", attemptedAt: newer(-1000), isCorrect: false },
  { drillId: "d1", attemptedAt: newer(-2000), isCorrect: true },
  { drillId: "d1", attemptedAt: newer(-3000), isCorrect: false },
  { drillId: "d3", attemptedAt: newer(-4000), isCorrect: true },
];

describe("migrateRadioDrillHistory", () => {
  it("returns [] for non-envelope input", () => {
    expect(migrateRadioDrillHistory(null)).toEqual([]);
    expect(migrateRadioDrillHistory({})).toEqual([]);
    expect(migrateRadioDrillHistory([])).toEqual([]);
    expect(migrateRadioDrillHistory(42)).toEqual([]);
  });

  it("drops the envelope when the schema tag mismatches", () => {
    const out = migrateRadioDrillHistory({
      v: 1,
      schemaTag: "ifr-radio-drill-history@99",
      attempts: [{ drillId: "d1", attemptedAt: newer(0), isCorrect: true }],
    });
    expect(out).toEqual([]);
  });

  it("filters out malformed entries inside a valid envelope", () => {
    const out = migrateRadioDrillHistory({
      v: 1,
      schemaTag: RADIO_DRILL_HISTORY_SCHEMA_TAG,
      attempts: [
        { drillId: "d1", attemptedAt: newer(0), isCorrect: true },
        { drillId: 42, attemptedAt: newer(0), isCorrect: true }, // bad type
        { attemptedAt: newer(0), isCorrect: true }, // missing field
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0]?.drillId).toBe("d1");
  });
});

describe("getDrillStats", () => {
  it("returns empty stats for a drill with no attempts", () => {
    expect(getDrillStats(attempts, "d-none")).toEqual({
      totalAttempts: 0,
      correctAttempts: 0,
      bestStreak: 0,
      lastAttemptedAt: null,
      lastIsCorrect: null,
    });
  });

  it("counts attempts and correct attempts", () => {
    const stats = getDrillStats(attempts, "d1");
    expect(stats.totalAttempts).toBe(3);
    expect(stats.correctAttempts).toBe(2);
  });

  it("computes best streak correctly (chronological order)", () => {
    // d1 history oldest-first: false, true, true → best streak = 2
    const stats = getDrillStats(attempts, "d1");
    expect(stats.bestStreak).toBe(2);
  });

  it("reports the most recent attempt's timestamp and correctness", () => {
    const stats = getDrillStats(attempts, "d1");
    expect(stats.lastAttemptedAt).toBe(attempts[0]!.attemptedAt);
    expect(stats.lastIsCorrect).toBe(true);
  });
});

describe("getAttemptedDrillIds / getPassedDrillIds", () => {
  it("getAttemptedDrillIds returns every distinct drill id", () => {
    expect(getAttemptedDrillIds(attempts)).toEqual(new Set(["d1", "d2", "d3"]));
  });

  it("getPassedDrillIds returns only drills with at least one correct attempt", () => {
    // d1 has correct attempts, d2 only failures, d3 has a correct.
    expect(getPassedDrillIds(attempts)).toEqual(new Set(["d1", "d3"]));
  });
});

describe("getRecentDrillIds", () => {
  it("dedupes by most-recent and respects the limit", () => {
    const ids = getRecentDrillIds(attempts, 2);
    // attempts are stored newest-first: d1, d2, d1, d1, d3.
    // After de-dup keeping newest: d1, d2, d3 — limit 2 → [d1, d2].
    expect(ids).toEqual(["d1", "d2"]);
  });

  it("returns at most `limit` ids even if more unique exist", () => {
    const ids = getRecentDrillIds(attempts, 100);
    expect(ids).toEqual(["d1", "d2", "d3"]);
  });
});
