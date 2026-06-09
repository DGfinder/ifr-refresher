import { describe, it, expect } from "vitest";
import {
  buildAnswer,
  buildSectionBreakdown,
  buildSessionResult,
  buildSessionStart,
  evaluateAnswer,
  isSessionOver,
  timerForNextQuestion,
} from "@/features/quiz/model/sessionLogic";
import type { DrillQuestion, QuizQuestion } from "@/features/drill";
import type { QuizSessionConfig } from "@/features/quiz";

const makeDrill = (i: number): DrillQuestion => ({
  id: `sec:mod:legacy_qa-${i}`,
  sectionId: "sec",
  sectionTitle: "Sec",
  moduleId: "mod",
  moduleTitle: "Mod",
  prompt: `Q ${i}?`,
  answer: `A ${i}`,
  kind: "legacy_qa",
  level: "core",
  tags: [],
});

const makeQuiz = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => ({
  id: "sec:mod:legacy_qa-0",
  sectionId: "sec",
  moduleId: "mod",
  prompt: "Q?",
  correctOptionId: "A",
  options: [
    { id: "A", text: "right" },
    { id: "B", text: "wrong1" },
    { id: "C", text: "wrong2" },
    { id: "D", text: "wrong3" },
  ],
  ...overrides,
});

describe("buildSessionStart", () => {
  it("returns null when there are no drill questions", () => {
    const config: QuizSessionConfig = { mode: "classic", questionCount: 10 };
    expect(buildSessionStart([], config)).toBeNull();
  });

  it("limits to questionCount when a number is given", () => {
    const drill = Array.from({ length: 20 }, (_, i) => makeDrill(i));
    const out = buildSessionStart(drill, { mode: "classic", questionCount: 5 });
    expect(out?.questions).toHaveLength(5);
  });

  it("uses the full pool when questionCount is 'all'", () => {
    const drill = Array.from({ length: 12 }, (_, i) => makeDrill(i));
    const out = buildSessionStart(drill, { mode: "classic", questionCount: "all" });
    expect(out?.questions).toHaveLength(12);
  });

  it("starts challenge mode with 3 lives", () => {
    const out = buildSessionStart([makeDrill(0)], { mode: "challenge", questionCount: 1 });
    expect(out?.startingLives).toBe(3);
  });

  it("uses sentinel lives outside challenge mode", () => {
    const out = buildSessionStart([makeDrill(0)], { mode: "classic", questionCount: 1 });
    expect(out?.startingLives).toBeGreaterThan(100);
  });

  it("sets timer for timed mode and zero otherwise", () => {
    const timed = buildSessionStart([makeDrill(0)], { mode: "timed", questionCount: 1, timePerQuestion: 15 });
    expect(timed?.startingTimer).toBe(15);

    const classic = buildSessionStart([makeDrill(0)], { mode: "classic", questionCount: 1 });
    expect(classic?.startingTimer).toBe(0);
  });

  it("falls back to 30s when timed mode has no explicit time", () => {
    const timed = buildSessionStart([makeDrill(0)], { mode: "timed", questionCount: 1 });
    expect(timed?.startingTimer).toBe(30);
  });
});

describe("evaluateAnswer", () => {
  it("flags correct answer and increments streak", () => {
    const q = makeQuiz();
    const out = evaluateAnswer(q, "A", { streak: 2, mode: "classic", timeSpentMs: 1000 });
    expect(out.isCorrect).toBe(true);
    expect(out.newStreak).toBe(3);
    expect(out.pointsEarned).toBeGreaterThan(0);
    expect(out.livesDelta).toBe(0);
  });

  it("zeros streak and points on wrong answer", () => {
    const q = makeQuiz();
    const out = evaluateAnswer(q, "B", { streak: 5, mode: "classic", timeSpentMs: 1000 });
    expect(out.isCorrect).toBe(false);
    expect(out.newStreak).toBe(0);
    expect(out.pointsEarned).toBe(0);
  });

  it("deducts a life on wrong answer in challenge mode only", () => {
    const q = makeQuiz();
    const challengeWrong = evaluateAnswer(q, "B", { streak: 0, mode: "challenge", timeSpentMs: 1000 });
    expect(challengeWrong.livesDelta).toBe(-1);

    const challengeRight = evaluateAnswer(q, "A", { streak: 0, mode: "challenge", timeSpentMs: 1000 });
    expect(challengeRight.livesDelta).toBe(0);

    const classicWrong = evaluateAnswer(q, "B", { streak: 0, mode: "classic", timeSpentMs: 1000 });
    expect(classicWrong.livesDelta).toBe(0);
  });
});

describe("buildAnswer", () => {
  it("records a selected correct answer", () => {
    const q = makeQuiz();
    const a = buildAnswer(q, "A", { timeSpentMs: 1500, skipped: false, flagged: false });
    expect(a).toMatchObject({
      questionId: q.id,
      selectedOptionId: "A",
      correctOptionId: "A",
      isCorrect: true,
      timeSpent: 1500,
      skipped: false,
      flagged: false,
    });
  });

  it("records a skip with null selection and isCorrect false", () => {
    const q = makeQuiz();
    const a = buildAnswer(q, null, { timeSpentMs: 9000, skipped: true, flagged: false });
    expect(a.selectedOptionId).toBeNull();
    expect(a.isCorrect).toBe(false);
    expect(a.skipped).toBe(true);
  });

  it("records flagged state when supplied", () => {
    const q = makeQuiz();
    const a = buildAnswer(q, "B", { timeSpentMs: 500, skipped: false, flagged: true });
    expect(a.flagged).toBe(true);
    expect(a.isCorrect).toBe(false);
  });
});

describe("timerForNextQuestion", () => {
  it("returns 0 for non-timed modes", () => {
    expect(timerForNextQuestion({ mode: "classic", questionCount: 1 })).toBe(0);
    expect(timerForNextQuestion({ mode: "learn", questionCount: 1 })).toBe(0);
    expect(timerForNextQuestion({ mode: "challenge", questionCount: 1 })).toBe(0);
  });

  it("returns the configured time for timed mode", () => {
    expect(timerForNextQuestion({ mode: "timed", questionCount: 1, timePerQuestion: 20 })).toBe(20);
  });

  it("defaults to 30s in timed mode without an explicit time", () => {
    expect(timerForNextQuestion({ mode: "timed", questionCount: 1 })).toBe(30);
  });
});

describe("isSessionOver", () => {
  it("ends challenge mode when lives drop to zero", () => {
    expect(
      isSessionOver({ mode: "challenge", currentIndex: 2, totalQuestions: 10, lives: 0 }),
    ).toBe(true);
  });

  it("does not end challenge mode while lives remain", () => {
    expect(
      isSessionOver({ mode: "challenge", currentIndex: 2, totalQuestions: 10, lives: 1 }),
    ).toBe(false);
  });

  it("ends any mode when reaching the final question", () => {
    expect(
      isSessionOver({ mode: "classic", currentIndex: 9, totalQuestions: 10, lives: 999 }),
    ).toBe(true);
  });

  it("keeps the session running on intermediate questions", () => {
    expect(
      isSessionOver({ mode: "classic", currentIndex: 4, totalQuestions: 10, lives: 999 }),
    ).toBe(false);
  });
});

describe("buildSectionBreakdown", () => {
  it("counts correct and total per sectionId", () => {
    const qs = [
      makeQuiz({ id: "a:m:legacy_qa-0", sectionId: "a" }),
      makeQuiz({ id: "a:m:legacy_qa-1", sectionId: "a" }),
      makeQuiz({ id: "b:m:legacy_qa-0", sectionId: "b" }),
    ];
    const answers = [
      buildAnswer(qs[0], "A", { timeSpentMs: 0, skipped: false, flagged: false }), // correct
      buildAnswer(qs[1], "B", { timeSpentMs: 0, skipped: false, flagged: false }), // wrong
      buildAnswer(qs[2], "A", { timeSpentMs: 0, skipped: false, flagged: false }), // correct
    ];
    const breakdown = buildSectionBreakdown(qs, answers);
    expect(breakdown).toEqual({
      a: { correct: 1, total: 2 },
      b: { correct: 1, total: 1 },
    });
  });

  it("counts questions with no answer as incorrect (total only)", () => {
    const qs = [makeQuiz({ id: "a:m:legacy_qa-0", sectionId: "a" })];
    const breakdown = buildSectionBreakdown(qs, []);
    expect(breakdown).toEqual({ a: { correct: 0, total: 1 } });
  });
});

describe("buildSessionResult", () => {
  const baseConfig: QuizSessionConfig = { mode: "classic", questionCount: 2 };
  const qs = [
    makeQuiz({ id: "sec:mod:legacy_qa-0", sectionId: "sec" }),
    makeQuiz({ id: "sec:mod:legacy_qa-1", sectionId: "sec" }),
  ];

  it("computes correct/incorrect/skipped counts and duration", () => {
    const answers = [
      buildAnswer(qs[0], "A", { timeSpentMs: 0, skipped: false, flagged: false }), // correct
      buildAnswer(qs[1], null, { timeSpentMs: 0, skipped: true, flagged: false }), // skipped
    ];
    const result = buildSessionResult({
      config: baseConfig,
      questions: qs,
      answers,
      score: 250,
      maxStreak: 1,
      sessionStartedAtMs: 1_000,
      nowMs: 11_000,
    });
    expect(result.totalQuestions).toBe(2);
    expect(result.correctAnswers).toBe(1);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.skippedAnswers).toBe(1);
    expect(result.timeSpent).toBe(10_000);
    expect(result.bySection.sec).toEqual({ correct: 1, total: 2 });
    expect(result.score).toBe(250);
    expect(result.maxStreak).toBe(1);
    expect(result.id).toMatch(/^quiz-/);
    expect(result.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("handles a perfect run", () => {
    const answers = qs.map((q) =>
      buildAnswer(q, "A", { timeSpentMs: 0, skipped: false, flagged: false }),
    );
    const result = buildSessionResult({
      config: baseConfig,
      questions: qs,
      answers,
      score: 500,
      maxStreak: 2,
      sessionStartedAtMs: 0,
      nowMs: 5_000,
    });
    expect(result.correctAnswers).toBe(2);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.skippedAnswers).toBe(0);
  });

  it("handles all-wrong with no skips", () => {
    const answers = qs.map((q) =>
      buildAnswer(q, "B", { timeSpentMs: 0, skipped: false, flagged: false }),
    );
    const result = buildSessionResult({
      config: baseConfig,
      questions: qs,
      answers,
      score: 0,
      maxStreak: 0,
      sessionStartedAtMs: 0,
      nowMs: 1_000,
    });
    expect(result.correctAnswers).toBe(0);
    expect(result.incorrectAnswers).toBe(2);
    expect(result.skippedAnswers).toBe(0);
  });
});
