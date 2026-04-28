import { describe, it, expect } from "vitest";
import { sections } from "@/data/sections";
import { buildDrillQuestions } from "../drill";

// ─── Data loading & integrity ─────────────────────────────────────────────────
// These tests validate the actual JSON data files load correctly and
// produce well-formed drill questions. They act as a canary for
// malformed data introduced during content editing.

describe("sections data loading", () => {
  it("loads at least 10 sections", () => {
    expect(sections.length).toBeGreaterThanOrEqual(10);
  });

  it("every section has required fields", () => {
    for (const section of sections) {
      expect(section.sectionId, `sectionId missing in ${JSON.stringify(section).slice(0, 80)}`).toBeTruthy();
      expect(section.sectionTitle).toBeTruthy();
      expect(Array.isArray(section.modules)).toBe(true);
      expect(Array.isArray(section.categories)).toBe(true);
    }
  });

  it("every module has required fields", () => {
    for (const section of sections) {
      for (const mod of section.modules) {
        expect(mod.id, `module.id missing in section ${section.sectionId}`).toBeTruthy();
        expect(mod.title).toBeTruthy();
        expect(Array.isArray(mod.content)).toBe(true);
      }
    }
  });

  it("no two sections share a sectionId", () => {
    const ids = sections.map((s) => s.sectionId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("no two modules share an id within the same section", () => {
    for (const section of sections) {
      const ids = section.modules.map((m) => m.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });
});

describe("buildDrillQuestions from real data", () => {
  const questions = buildDrillQuestions(sections);

  it("produces questions from all sections", () => {
    expect(questions.length).toBeGreaterThan(100);
  });

  it("every question has a non-empty prompt", () => {
    const empty = questions.filter((q) => !q.prompt || q.prompt.trim() === "");
    expect(empty.length).toBe(0);
  });

  it("every question has a non-empty answer", () => {
    const empty = questions.filter((q) => !q.answer || q.answer.trim() === "");
    expect(empty.length).toBe(0);
  });

  it("all question IDs are unique", () => {
    const ids = questions.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every question has a known kind", () => {
    const validKinds = new Set(["legacy_qa", "ipc", "airline", "trap", "numeric"]);
    const invalid = questions.filter((q) => !validKinds.has(q.kind));
    expect(invalid).toHaveLength(0);
  });

  it("every question has a sectionId and moduleId", () => {
    const missing = questions.filter((q) => !q.sectionId || !q.moduleId);
    expect(missing).toHaveLength(0);
  });

  it("questions with distractors have exactly 3", () => {
    const withDistractors = questions.filter((q) => q.distractors !== undefined);
    for (const q of withDistractors) {
      expect(q.distractors!.length, `Question ${q.id} has ${q.distractors!.length} distractors`).toBe(3);
    }
  });
});
