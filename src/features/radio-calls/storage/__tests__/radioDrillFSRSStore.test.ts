import { describe, expect, it } from "vitest";
import type { Card } from "ts-fsrs";
import {
  getDueDrillIds,
  getNextDueAt,
  getScheduleState,
  getScheduledDrillIds,
  migrateRadioDrillFSRSStore,
  RADIO_DRILL_FSRS_SCHEMA_TAG,
  wrapFSRSCard,
  type RadioDrillFSRSStore,
} from "@/features/radio-calls/storage/radioDrillFSRSStore";

// Construct minimal Card stand-ins for tests — only `due` is read by the
// selectors. ts-fsrs' Card has many other fields the selectors ignore.
function makeCardDue(dueIso: string): Card {
  return {
    due: new Date(dueIso),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: 1,
  } as unknown as Card;
}

describe("migrateRadioDrillFSRSStore", () => {
  it("returns {} for non-object input", () => {
    expect(migrateRadioDrillFSRSStore(null)).toEqual({});
    expect(migrateRadioDrillFSRSStore(undefined)).toEqual({});
    expect(migrateRadioDrillFSRSStore("nope")).toEqual({});
    expect(migrateRadioDrillFSRSStore(42)).toEqual({});
  });

  it("drops entries whose schemaTag doesn't match", () => {
    const raw = {
      "drill-a": {
        v: 1,
        schemaTag: "ts-fsrs@99",
        card: makeCardDue("2026-01-01T00:00:00Z"),
      },
    };
    expect(migrateRadioDrillFSRSStore(raw)).toEqual({});
  });

  it("keeps entries with the current schemaTag", () => {
    const env = wrapFSRSCard(makeCardDue("2026-01-01T00:00:00Z"));
    const raw = { "drill-a": env };
    const out = migrateRadioDrillFSRSStore(raw);
    expect(out["drill-a"]).toBeDefined();
    expect(out["drill-a"]?.schemaTag).toBe(RADIO_DRILL_FSRS_SCHEMA_TAG);
  });

  it("filters malformed entries inside an otherwise valid store", () => {
    const env = wrapFSRSCard(makeCardDue("2026-01-01T00:00:00Z"));
    const raw = {
      "drill-good": env,
      "drill-bad": { v: 0, schemaTag: "x", card: null },
      "drill-missing-card": { v: 1, schemaTag: RADIO_DRILL_FSRS_SCHEMA_TAG },
    };
    const out = migrateRadioDrillFSRSStore(raw);
    expect(Object.keys(out)).toEqual(["drill-good"]);
  });
});

describe("FSRS selectors", () => {
  const past = "2020-01-01T00:00:00Z";
  const future = "2099-12-31T23:59:59Z";
  const store: RadioDrillFSRSStore = {
    "drill-due-old": wrapFSRSCard(makeCardDue(past)),
    "drill-due-now": wrapFSRSCard(makeCardDue(new Date().toISOString())),
    "drill-later": wrapFSRSCard(makeCardDue(future)),
  };

  it("getDueDrillIds returns scheduled cards whose due time has passed", () => {
    const out = getDueDrillIds(store);
    expect(out.has("drill-due-old")).toBe(true);
    expect(out.has("drill-due-now")).toBe(true);
    expect(out.has("drill-later")).toBe(false);
  });

  it("getScheduledDrillIds returns every scheduled id (due + later)", () => {
    expect(getScheduledDrillIds(store)).toEqual(
      new Set(["drill-due-old", "drill-due-now", "drill-later"]),
    );
  });

  it("getNextDueAt returns the due date when scheduled, null otherwise", () => {
    const dueAt = getNextDueAt(store, "drill-later");
    expect(dueAt).toEqual(new Date(future));
    expect(getNextDueAt(store, "drill-not-in-store")).toBeNull();
  });

  it("getScheduleState classifies each card", () => {
    expect(getScheduleState(store, "drill-due-old")).toBe("due");
    expect(getScheduleState(store, "drill-due-now")).toBe("due");
    expect(getScheduleState(store, "drill-later")).toBe("later");
    expect(getScheduleState(store, "drill-never-seen")).toBe("new");
  });

  it("getScheduleState respects a custom 'now' argument", () => {
    // With 'now' before all due times, everything scheduled is "later".
    const longAgo = new Date("1900-01-01T00:00:00Z");
    expect(getScheduleState(store, "drill-due-old", longAgo)).toBe("later");
    expect(getScheduleState(store, "drill-due-now", longAgo)).toBe("later");
    expect(getScheduleState(store, "drill-later", longAgo)).toBe("later");
  });
});
