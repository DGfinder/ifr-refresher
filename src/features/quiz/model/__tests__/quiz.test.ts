import { describe, expect, it } from "vitest";
import {
  buildQuizQuestions,
  getQuizEligibleQuestions,
  hasValidAuthoredDistractors,
} from "@/features/quiz/model/buildQuizQuestions";
import type { DrillQuestion } from "@/features/drill";

const makeQuestion = (overrides: Partial<DrillQuestion> = {}): DrillQuestion => ({
  id: "test-section:mod-1:legacy_qa-0",
  sectionId: "test-section",
  sectionTitle: "Test Section",
  moduleId: "mod-1",
  moduleTitle: "Module 1",
  prompt: "What is the final reserve fuel for IFR ≤5700kg?",
  answer: "45 minutes.",
  distractors: ["30 minutes.", "60 minutes.", "90 minutes."],
  kind: "legacy_qa",
  level: "core",
  tags: ["fuel", "legacy_qa"],
  ...overrides,
});

const makeAuthoredPool = (count: number): DrillQuestion[] =>
  Array.from({ length: count }, (_, i) => makeQuestion({
    id: `test-section:mod-1:legacy_qa-${i}`,
    prompt: `Question ${i}?`,
    answer: `Answer ${i}`,
    distractors: [`Wrong ${i}A`, `Wrong ${i}B`, `Wrong ${i}C`],
  }));

describe("authored quiz eligibility", () => {
  it("accepts an authored answer with three distinct, non-empty wrong answers", () => {
    expect(hasValidAuthoredDistractors(makeQuestion())).toBe(true);
  });

  it("rejects a question that has no distractors", () => {
    const question = makeQuestion();
    delete question.distractors;
    expect(hasValidAuthoredDistractors(question)).toBe(false);
  });

  it("rejects a question with an empty prompt", () => {
    expect(hasValidAuthoredDistractors(makeQuestion({ prompt: "  " }))).toBe(false);
  });

  it.each([
    ["has fewer than three distractors", { distractors: ["A", "B"] }],
    ["has more than three distractors", { distractors: ["A", "B", "C", "D"] }],
    ["has an empty distractor", { distractors: ["A", "", "C"] }],
    ["duplicates a distractor after normalization", { distractors: ["A", " a ", "C"] }],
    ["repeats the correct answer after normalization", { distractors: ["45 MINUTES.", "A", "B"] }],
  ])("rejects a question that %s", (_reason, overrides) => {
    expect(hasValidAuthoredDistractors(makeQuestion(overrides))).toBe(false);
  });

  it("filters an assessment bank to valid authored MCQs only", () => {
    const valid = makeQuestion({ id: "valid" });
    const unscored = makeQuestion({ id: "unscored" });
    delete unscored.distractors;
    const malformed = makeQuestion({ id: "malformed", distractors: ["A", "A", "C"] });

    expect(getQuizEligibleQuestions([valid, unscored, malformed])).toEqual([valid]);
  });
});

describe("buildQuizQuestions", () => {
  it("returns an empty assessment when no authored MCQs are available", () => {
    const question = makeQuestion();
    delete question.distractors;
    expect(buildQuizQuestions([question])).toEqual([]);
  });

  it("returns only authored MCQs and respects the limit", () => {
    const authored = makeAuthoredPool(4);
    const unscored = makeQuestion({ id: "unscored" });
    delete unscored.distractors;
    const result = buildQuizQuestions([...authored, unscored], 2);

    expect(result).toHaveLength(2);
    expect(result.every((question) => question.id !== "unscored")).toBe(true);
  });

  it("keeps each authored answer and its own authored distractors together", () => {
    const question = makeQuestion({
      answer: "Correct answer",
      distractors: ["Distractor X", "Distractor Y", "Distractor Z"],
    });
    const unrelated = makeQuestion({
      id: "unrelated",
      answer: "Unrelated answer",
      distractors: ["Other A", "Other B", "Other C"],
    });
    const result = buildQuizQuestions([question, unrelated]);
    const built = result.find((item) => item.id === question.id)!;

    expect(built.options.map((option) => option.text).sort()).toEqual([
      "Correct answer",
      "Distractor X",
      "Distractor Y",
      "Distractor Z",
    ]);
  });

  it("creates four uniquely labelled options and points to the correct answer", () => {
    const [result] = buildQuizQuestions([makeQuestion()]);
    expect(result!.options.map((option) => option.id)).toEqual(["A", "B", "C", "D"]);
    expect(new Set(result!.options.map((option) => option.text)).size).toBe(4);
    expect(result!.options.find((option) => option.id === result!.correctOptionId)?.text).toBe("45 minutes.");
  });
});
