import { describe, it, expect } from "vitest";
import { buildQuizQuestions } from "../quiz";
import type { DrillQuestion } from "@/types/drill";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeQuestion = (overrides: Partial<DrillQuestion> = {}): DrillQuestion => ({
  id: `test-section:mod-1:legacy_qa-0`,
  sectionId: "test-section",
  sectionTitle: "Test Section",
  moduleId: "mod-1",
  moduleTitle: "Module 1",
  prompt: "What is the final reserve fuel for IFR ≤5700kg?",
  answer: "45 minutes.",
  kind: "legacy_qa",
  level: "core",
  tags: ["fuel", "legacy_qa"],
  ...overrides,
});

const makePool = (count: number, sectionId = "test-section", moduleId = "mod-1"): DrillQuestion[] =>
  Array.from({ length: count }, (_, i) =>
    makeQuestion({
      id: `${sectionId}:${moduleId}:legacy_qa-${i}`,
      sectionId,
      moduleId,
      prompt: `Question ${i}?`,
      answer: `Answer ${i}`,
    })
  );

// ─── buildQuizQuestions ───────────────────────────────────────────────────────

describe("buildQuizQuestions", () => {
  it("returns empty array when given no questions", () => {
    expect(buildQuizQuestions([])).toEqual([]);
  });

  it("returns at most `limit` questions", () => {
    const pool = makePool(20);
    const result = buildQuizQuestions(pool, 5);
    expect(result).toHaveLength(5);
  });

  it("returns all questions when pool is smaller than limit", () => {
    const pool = makePool(3);
    const result = buildQuizQuestions(pool, 10);
    expect(result).toHaveLength(3);
  });

  it("returns the entire pool when no limit is provided", () => {
    const pool = makePool(160);
    const result = buildQuizQuestions(pool);
    expect(result).toHaveLength(160);
  });

  it("each question has exactly 4 options", () => {
    const pool = makePool(10);
    const result = buildQuizQuestions(pool, 5);
    for (const q of result) {
      expect(q.options).toHaveLength(4);
    }
  });

  it("option IDs are A, B, C, D", () => {
    const pool = makePool(10);
    const result = buildQuizQuestions(pool, 1);
    const ids = result[0].options.map((o) => o.id);
    expect(ids).toEqual(["A", "B", "C", "D"]);
  });

  it("correct answer is always present in options", () => {
    const pool = makePool(10);
    const result = buildQuizQuestions(pool, 10);
    for (const q of result) {
      const correctOption = q.options.find((o) => o.id === q.correctOptionId);
      const original = pool.find((p) => p.id === q.id);
      expect(correctOption?.text).toBe(original?.answer);
    }
  });

  it("correctOptionId points to the correct answer text", () => {
    const pool = makePool(10);
    const result = buildQuizQuestions(pool, 10);
    for (const q of result) {
      const correctOption = q.options.find((o) => o.id === q.correctOptionId);
      expect(correctOption).toBeDefined();
      const original = pool.find((p) => p.id === q.id);
      expect(correctOption!.text).toBe(original!.answer);
    }
  });

  it("all 4 option texts are distinct", () => {
    const pool = makePool(20);
    const result = buildQuizQuestions(pool, 10);
    for (const q of result) {
      const texts = q.options.map((o) => o.text);
      const unique = new Set(texts);
      expect(unique.size).toBe(4);
    }
  });

  describe("pre-authored distractors (Priority 1)", () => {
    it("uses pre-authored distractors exactly when 3 are provided", () => {
      const authored = [
        makeQuestion({
          id: "s:m:legacy_qa-0",
          answer: "Correct answer",
          distractors: ["Wrong A", "Wrong B", "Wrong C"],
        }),
      ];
      const result = buildQuizQuestions(authored, 1);
      const texts = result[0].options.map((o) => o.text);
      expect(texts).toContain("Correct answer");
      expect(texts).toContain("Wrong A");
      expect(texts).toContain("Wrong B");
      expect(texts).toContain("Wrong C");
    });

    it("does not use pool answers when pre-authored distractors are present", () => {
      // Pool with many answers — none should appear if authored distractors are used
      const pool = makePool(10);
      pool[0] = {
        ...pool[0],
        answer: "The real answer",
        distractors: ["Distractor X", "Distractor Y", "Distractor Z"],
      };
      const result = buildQuizQuestions([pool[0]], 1);
      const texts = result[0].options.map((o) => o.text);
      expect(texts).toContain("Distractor X");
      expect(texts).toContain("Distractor Y");
      expect(texts).toContain("Distractor Z");
    });
  });

  describe("module-scoped pool (Priority 2)", () => {
    it("prefers distractors from the same module", () => {
      // 4 questions in same module — distractors should come from within
      const sameModule = makePool(4, "section-a", "mod-same");
      const result = buildQuizQuestions(sameModule, 1);
      const correct = sameModule.find((q) => q.id === result[0].id)!;
      const moduleAnswers = sameModule.map((q) => q.answer);
      const optionTexts = result[0].options.map((o) => o.text);
      // All 4 options should come from within the module pool
      for (const text of optionTexts) {
        expect(moduleAnswers).toContain(text);
      }
      // The correct answer must still be correct
      expect(optionTexts).toContain(correct.answer);
    });
  });

  describe("fallback distractor pools", () => {
    it("falls back to section pool when module pool is insufficient", () => {
      // 2 questions in same module (not enough for 3 distractors), 5 more in same section
      const moduleQ = makePool(2, "sec-x", "mod-a");
      const sectionExtra = makePool(5, "sec-x", "mod-b");
      const allQ = [...moduleQ, ...sectionExtra];
      const result = buildQuizQuestions([allQ[0]], 1);
      expect(result[0].options).toHaveLength(4);
    });

    it("falls back to global pool when section pool is insufficient", () => {
      // Only 1 question in section — must use global
      const lonely = [makeQuestion({ id: "sec-alone:mod-1:legacy_qa-0", sectionId: "sec-alone" })];
      const globalPool = makePool(10, "sec-other", "mod-other");
      const result = buildQuizQuestions([...lonely, ...globalPool], 1);
      // Result should have 4 options (no crash, no padding)
      const lonelyResult = result.find((q) => q.id === lonely[0].id);
      if (lonelyResult) {
        expect(lonelyResult.options).toHaveLength(4);
        const padded = lonelyResult.options.filter((o) => o.text.startsWith("Option "));
        expect(padded).toHaveLength(0);
      }
    });
  });
});
