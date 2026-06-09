import { describe, it, expect } from "vitest";
import { migrateQuizProgressIds } from "@/features/quiz/storage/quizHistoryStore";
import { createInitialProgress } from "@/features/quiz/model/types";
import type { QuizAnswer, QuizProgress, QuizResult } from "@/features/quiz/model/types";
import type { DrillQuestion } from "@/features/drill";
import { questionIdFor } from "@/features/drill";

const newId = (prompt: string) =>
  questionIdFor("sec", "mod", "legacy_qa", prompt);

const questions: DrillQuestion[] = [
  {
    id: newId("First Q"),
    sectionId: "sec",
    sectionTitle: "Sec",
    moduleId: "mod",
    moduleTitle: "Mod",
    prompt: "First Q",
    answer: "First A",
    kind: "legacy_qa",
    level: "core",
    tags: [],
  },
  {
    id: newId("Second Q"),
    sectionId: "sec",
    sectionTitle: "Sec",
    moduleId: "mod",
    moduleTitle: "Mod",
    prompt: "Second Q",
    answer: "Second A",
    kind: "legacy_qa",
    level: "core",
    tags: [],
  },
];

const baseAnswer = (questionId: string): QuizAnswer => ({
  questionId,
  selectedOptionId: "A",
  correctOptionId: "A",
  isCorrect: true,
  timeSpent: 1000,
  skipped: false,
  flagged: false,
});

const baseResult = (answers: QuizAnswer[]): QuizResult => ({
  id: "quiz-1",
  mode: "classic",
  completedAt: "2026-06-09T10:00:00Z",
  totalQuestions: answers.length,
  correctAnswers: answers.filter((a) => a.isCorrect).length,
  incorrectAnswers: 0,
  skippedAnswers: 0,
  score: 100,
  maxStreak: 1,
  timeSpent: 10_000,
  answers,
  bySection: { sec: { correct: answers.length, total: answers.length } },
});

describe("migrateQuizProgressIds", () => {
  it("returns changed=false when nothing needs migration", () => {
    const progress: QuizProgress = {
      ...createInitialProgress(),
      history: [baseResult([baseAnswer(newId("First Q"))])],
      masteredQuestions: [newId("First Q")],
    };
    const out = migrateQuizProgressIds(progress, questions);
    expect(out.changed).toBe(false);
    expect(out.progress).toBe(progress);
  });

  it("rewrites old-format ids inside answers", () => {
    const progress: QuizProgress = {
      ...createInitialProgress(),
      history: [baseResult([baseAnswer("sec:mod:legacy_qa-0")])],
    };
    const out = migrateQuizProgressIds(progress, questions);
    expect(out.changed).toBe(true);
    expect(out.progress.history[0]!.answers[0]!.questionId).toBe(newId("First Q"));
  });

  it("rewrites old-format ids in the mastered list", () => {
    const progress: QuizProgress = {
      ...createInitialProgress(),
      masteredQuestions: ["sec:mod:legacy_qa-0", "sec:mod:legacy_qa-1"],
    };
    const out = migrateQuizProgressIds(progress, questions);
    expect(out.changed).toBe(true);
    expect(out.progress.masteredQuestions).toEqual([
      newId("First Q"),
      newId("Second Q"),
    ]);
  });

  it("drops mastered entries whose old id no longer resolves", () => {
    const progress: QuizProgress = {
      ...createInitialProgress(),
      masteredQuestions: ["sec:mod:legacy_qa-99"],
    };
    const out = migrateQuizProgressIds(progress, questions);
    expect(out.changed).toBe(true);
    expect(out.progress.masteredQuestions).toEqual([]);
  });

  it("preserves a mixed history (some answers old, some new)", () => {
    const progress: QuizProgress = {
      ...createInitialProgress(),
      history: [
        baseResult([
          baseAnswer("sec:mod:legacy_qa-0"),
          baseAnswer(newId("Second Q")),
        ]),
      ],
    };
    const out = migrateQuizProgressIds(progress, questions);
    expect(out.changed).toBe(true);
    const ids = out.progress.history[0]!.answers.map((a) => a.questionId);
    expect(ids).toEqual([newId("First Q"), newId("Second Q")]);
  });

  it("is idempotent — running twice yields no further change", () => {
    const progress: QuizProgress = {
      ...createInitialProgress(),
      masteredQuestions: ["sec:mod:legacy_qa-0"],
      history: [baseResult([baseAnswer("sec:mod:legacy_qa-1")])],
    };
    const first = migrateQuizProgressIds(progress, questions);
    expect(first.changed).toBe(true);
    const second = migrateQuizProgressIds(first.progress, questions);
    expect(second.changed).toBe(false);
    expect(second.progress).toBe(first.progress);
  });
});
