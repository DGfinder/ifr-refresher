import { describe, it, expect } from "vitest";
import { createEmptyCard } from "ts-fsrs";
import {
  FSRS_SCHEMA_TAG,
  migrateFSRSStore,
  wrapCard,
  type FSRSCardEnvelope,
} from "@/features/drill/model/fsrsStorage";

describe("wrapCard", () => {
  it("returns a v1 envelope with the current schema tag", () => {
    const card = createEmptyCard();
    const env = wrapCard(card);
    expect(env.v).toBe(1);
    expect(env.schemaTag).toBe(FSRS_SCHEMA_TAG);
    expect(env.card).toBe(card);
    expect(env.updatedAt).toBeTypeOf("string");
  });
});

describe("migrateFSRSStore", () => {
  it("returns empty store when input is null/undefined", () => {
    expect(migrateFSRSStore(null)).toEqual({});
    expect(migrateFSRSStore(undefined)).toEqual({});
  });

  it("returns empty store when input is a primitive", () => {
    expect(migrateFSRSStore("oops")).toEqual({});
    expect(migrateFSRSStore(42)).toEqual({});
  });

  it("preserves entries already wrapped in a current-schema envelope", () => {
    const card = createEmptyCard();
    const stored = {
      "sec:mod:legacy_qa-0": wrapCard(card),
    };
    const out = migrateFSRSStore(stored);
    expect(out["sec:mod:legacy_qa-0"]).toBeDefined();
    expect(out["sec:mod:legacy_qa-0"].schemaTag).toBe(FSRS_SCHEMA_TAG);
    expect(out["sec:mod:legacy_qa-0"].card).toEqual(card);
  });

  it("drops entries with a mismatched schemaTag (e.g. future ts-fsrs)", () => {
    const card = createEmptyCard();
    const futureEnvelope: FSRSCardEnvelope = {
      v: 1,
      schemaTag: "ts-fsrs@6",
      card,
    };
    const out = migrateFSRSStore({
      kept: wrapCard(card),
      dropped: futureEnvelope,
    });
    expect(out.kept).toBeDefined();
    expect(out.dropped).toBeUndefined();
  });

  it("wraps a pre-envelope raw Card (the legacy v0 shape)", () => {
    const card = createEmptyCard();
    const legacyStore = {
      "sec:mod:legacy_qa-0": card, // raw Card, no envelope
    };
    const out = migrateFSRSStore(legacyStore);
    const entry = out["sec:mod:legacy_qa-0"];
    expect(entry).toBeDefined();
    expect(entry.v).toBe(1);
    expect(entry.schemaTag).toBe(FSRS_SCHEMA_TAG);
    expect(entry.card).toBe(card);
  });

  it("handles a mix of legacy and envelope entries in one store", () => {
    const legacyCard = createEmptyCard();
    const envelopedCard = createEmptyCard();
    const mixed = {
      legacy: legacyCard,
      enveloped: wrapCard(envelopedCard),
    };
    const out = migrateFSRSStore(mixed);
    expect(out.legacy.card).toBe(legacyCard);
    expect(out.enveloped.card).toBe(envelopedCard);
  });

  it("drops corrupt entries silently and keeps the rest", () => {
    const card = createEmptyCard();
    const corrupt = {
      good: wrapCard(card),
      missingFields: { foo: "bar" },
      nullEntry: null,
      stringy: "not a card",
    };
    const out = migrateFSRSStore(corrupt);
    expect(out.good).toBeDefined();
    expect(out.missingFields).toBeUndefined();
    expect(out.nullEntry).toBeUndefined();
    expect(out.stringy).toBeUndefined();
  });

  it("does not mutate the input", () => {
    const card = createEmptyCard();
    const input = { x: card };
    const snapshot = JSON.parse(JSON.stringify(input));
    migrateFSRSStore(input);
    expect(JSON.parse(JSON.stringify(input))).toEqual(snapshot);
  });
});
