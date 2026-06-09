import { describe, it, expect } from "vitest";
import {
  fnv1aHex,
  isOldQuestionId,
  migrateOldQuestionId,
  migrateQuestionIdList,
  migrateQuestionIdMap,
  questionIdFor,
} from "@/features/drill/model/questionIds";
import type { DrillQuestion } from "@/features/drill/model/types";

const make = (overrides: Partial<DrillQuestion>): DrillQuestion => ({
  id: "x",
  sectionId: "sec",
  sectionTitle: "Sec",
  moduleId: "mod",
  moduleTitle: "Mod",
  prompt: "default prompt",
  answer: "default answer",
  kind: "legacy_qa",
  level: "core",
  tags: [],
  ...overrides,
});

describe("fnv1aHex", () => {
  it("returns 8-char lowercase hex", () => {
    const h = fnv1aHex("hello");
    expect(h).toMatch(/^[0-9a-f]{8}$/);
  });

  it("is deterministic for the same input", () => {
    expect(fnv1aHex("foo")).toBe(fnv1aHex("foo"));
  });

  it("differentiates similar inputs", () => {
    expect(fnv1aHex("foo")).not.toBe(fnv1aHex("foa"));
  });

  it("handles empty string", () => {
    expect(fnv1aHex("")).toMatch(/^[0-9a-f]{8}$/);
  });

  it("handles unicode prompts", () => {
    const a = fnv1aHex("Climb FL220 — squawk 4123");
    const b = fnv1aHex("Climb FL220 - squawk 4123");
    expect(a).not.toBe(b);
  });
});

describe("questionIdFor", () => {
  it("composes section:module:kind:hash", () => {
    const id = questionIdFor("sec-a", "mod-1", "legacy_qa", "What's the QNH?");
    expect(id).toMatch(/^sec-a:mod-1:legacy_qa:[0-9a-f]{8}$/);
  });

  it("returns the same id for the same prompt", () => {
    expect(questionIdFor("a", "b", "ipc", "p")).toBe(questionIdFor("a", "b", "ipc", "p"));
  });

  it("returns different ids for different prompts in the same module/kind", () => {
    const a = questionIdFor("a", "b", "ipc", "prompt 1");
    const b = questionIdFor("a", "b", "ipc", "prompt 2");
    expect(a).not.toBe(b);
  });
});

describe("isOldQuestionId", () => {
  it("recognises the old kind-index format", () => {
    expect(isOldQuestionId("sec:mod:legacy_qa-0")).toBe(true);
    expect(isOldQuestionId("section-a:module-1:trap-12")).toBe(true);
    expect(isOldQuestionId("a:b:numeric-3")).toBe(true);
  });

  it("rejects the new hash-suffix format", () => {
    expect(isOldQuestionId("sec:mod:legacy_qa:deadbeef")).toBe(false);
    expect(isOldQuestionId("a:b:ipc:01234567")).toBe(false);
  });

  it("rejects arbitrary strings", () => {
    expect(isOldQuestionId("just a string")).toBe(false);
    expect(isOldQuestionId("")).toBe(false);
    expect(isOldQuestionId("sec:mod")).toBe(false);
  });
});

describe("migrateOldQuestionId", () => {
  const questions: DrillQuestion[] = [
    make({
      id: questionIdFor("sec", "mod", "legacy_qa", "First Q"),
      sectionId: "sec",
      moduleId: "mod",
      kind: "legacy_qa",
      prompt: "First Q",
    }),
    make({
      id: questionIdFor("sec", "mod", "legacy_qa", "Second Q"),
      sectionId: "sec",
      moduleId: "mod",
      kind: "legacy_qa",
      prompt: "Second Q",
    }),
    make({
      id: questionIdFor("sec", "mod", "trap", "trap A"),
      sectionId: "sec",
      moduleId: "mod",
      kind: "trap",
      prompt: "trap A",
    }),
  ];

  it("maps an old id to the new id for the same (section, module, kind, index)", () => {
    expect(migrateOldQuestionId("sec:mod:legacy_qa-0", questions)).toBe(questions[0]!.id);
    expect(migrateOldQuestionId("sec:mod:legacy_qa-1", questions)).toBe(questions[1]!.id);
    expect(migrateOldQuestionId("sec:mod:trap-0", questions)).toBe(questions[2]!.id);
  });

  it("returns null when the index is out of bounds", () => {
    expect(migrateOldQuestionId("sec:mod:legacy_qa-99", questions)).toBeNull();
  });

  it("returns null for unrecognised section/module/kind", () => {
    expect(migrateOldQuestionId("missing:mod:legacy_qa-0", questions)).toBeNull();
    expect(migrateOldQuestionId("sec:missing:legacy_qa-0", questions)).toBeNull();
    expect(migrateOldQuestionId("sec:mod:ipc-0", questions)).toBeNull();
  });

  it("returns null for malformed inputs", () => {
    expect(migrateOldQuestionId("not even close", questions)).toBeNull();
    expect(migrateOldQuestionId("sec:mod:kind:already-new", questions)).toBeNull();
  });
});

describe("migrateQuestionIdMap", () => {
  const newId = questionIdFor("s", "m", "legacy_qa", "P");
  const questions: DrillQuestion[] = [
    make({ id: newId, sectionId: "s", moduleId: "m", kind: "legacy_qa", prompt: "P" }),
  ];

  it("rewrites old keys and reports changed=true", () => {
    const { record, changed } = migrateQuestionIdMap({ "s:m:legacy_qa-0": { hits: 3 } }, questions);
    expect(record).toEqual({ [newId]: { hits: 3 } });
    expect(changed).toBe(true);
  });

  it("passes through already-new keys with changed=false", () => {
    const { record, changed } = migrateQuestionIdMap({ [newId]: { hits: 1 } }, questions);
    expect(record).toEqual({ [newId]: { hits: 1 } });
    expect(changed).toBe(false);
  });

  it("drops unresolvable old keys (and reports changed)", () => {
    const { record, changed } = migrateQuestionIdMap(
      { "s:m:legacy_qa-99": { hits: 1 } },
      questions,
    );
    expect(record).toEqual({});
    expect(changed).toBe(true);
  });

  it("preserves non-id keys (defensive)", () => {
    const { record, changed } = migrateQuestionIdMap({ "arbitrary-key": { hits: 1 } }, questions);
    expect(record).toEqual({ "arbitrary-key": { hits: 1 } });
    expect(changed).toBe(false);
  });
});

describe("migrateQuestionIdList", () => {
  const newId = questionIdFor("s", "m", "legacy_qa", "P");
  const questions: DrillQuestion[] = [
    make({ id: newId, sectionId: "s", moduleId: "m", kind: "legacy_qa", prompt: "P" }),
  ];

  it("rewrites old entries and reports changed", () => {
    const { ids, changed } = migrateQuestionIdList(["s:m:legacy_qa-0", newId], questions);
    expect(ids).toEqual([newId, newId]);
    expect(changed).toBe(true);
  });

  it("returns input unchanged when all ids are already new", () => {
    const { ids, changed } = migrateQuestionIdList([newId], questions);
    expect(ids).toEqual([newId]);
    expect(changed).toBe(false);
  });

  it("drops unresolvable old ids", () => {
    const { ids, changed } = migrateQuestionIdList(["s:m:legacy_qa-99"], questions);
    expect(ids).toEqual([]);
    expect(changed).toBe(true);
  });
});
