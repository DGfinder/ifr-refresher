import { describe, it, expect } from "vitest";
import type { RadioMCQ, RadioScenario } from "@/content/model/radio";
import {
  buildRadioAnswer,
  buildRadioResult,
  buildRadioSession,
  evaluateRadioMcq,
  isRadioSessionOver,
} from "@/features/radio-calls/model/buildRadioSession";
import type { RadioAnswerMap } from "@/features/radio-calls/model/types";

const makeMcq = (id: string): RadioMCQ => ({
  id,
  prompt: "Pick the right call.",
  options: [
    { id: "A", text: "wrong 1" },
    { id: "B", text: "right" },
    { id: "C", text: "wrong 2" },
    { id: "D", text: "wrong 3" },
  ],
  correctOptionId: "B",
});

const makeScenario = (): RadioScenario => ({
  version: "1.0",
  scenarioId: "test-scenario",
  title: "Test",
  briefing: {
    callsign: "VH-TEST",
    flightRules: "IFR",
    summary: "Test scenario.",
  },
  legs: [
    {
      id: "leg-1",
      transmission: { speaker: "pilot", text: "..." },
      question: makeMcq("q1"),
    },
    {
      id: "leg-2",
      transmission: { speaker: "atc", text: "ATC response..." },
    },
    {
      id: "leg-3",
      transmission: { speaker: "pilot", text: "..." },
      question: makeMcq("q2"),
    },
  ],
  refs: [
    { source: "AIP GEN 3.4", note: "Test reference" },
  ],
});

describe("buildRadioSession", () => {
  it("counts only legs with a question as questions", () => {
    const session = buildRadioSession(makeScenario());
    expect(session.totalLegs).toBe(3);
    expect(session.totalQuestions).toBe(2);
  });

  it("returns the same scenario reference (no mutation)", () => {
    const scenario = makeScenario();
    const session = buildRadioSession(scenario);
    expect(session.scenario).toBe(scenario);
  });
});

describe("evaluateRadioMcq", () => {
  it("flags the correct option", () => {
    const out = evaluateRadioMcq(makeMcq("q1"), "B");
    expect(out.isCorrect).toBe(true);
    expect(out.correctOptionId).toBe("B");
  });

  it("flags wrong options without ever lying about the correct id", () => {
    const out = evaluateRadioMcq(makeMcq("q1"), "A");
    expect(out.isCorrect).toBe(false);
    expect(out.correctOptionId).toBe("B");
  });
});

describe("buildRadioAnswer", () => {
  it("builds a correct answer record", () => {
    const a = buildRadioAnswer(makeMcq("q1"), "B");
    expect(a).toEqual({
      questionId: "q1",
      selectedOptionId: "B",
      correctOptionId: "B",
      isCorrect: true,
    });
  });

  it("builds an incorrect answer record without altering the correctOptionId", () => {
    const a = buildRadioAnswer(makeMcq("q1"), "C");
    expect(a.isCorrect).toBe(false);
    expect(a.correctOptionId).toBe("B");
    expect(a.selectedOptionId).toBe("C");
  });
});

describe("isRadioSessionOver", () => {
  it("returns true on the final leg", () => {
    expect(isRadioSessionOver(2, 3)).toBe(true);
  });

  it("returns false before the final leg", () => {
    expect(isRadioSessionOver(0, 3)).toBe(false);
    expect(isRadioSessionOver(1, 3)).toBe(false);
  });
});

describe("buildRadioResult", () => {
  it("aggregates only legs that have a question + an answer", () => {
    const scenario = makeScenario();
    const answers: RadioAnswerMap = {
      q1: buildRadioAnswer(scenario.legs[0]!.question!, "B"),
      q2: buildRadioAnswer(scenario.legs[2]!.question!, "C"),
    };
    const result = buildRadioResult(scenario, answers);
    expect(result.totalQuestions).toBe(2);
    expect(result.correctAnswers).toBe(1);
    expect(result.percentage).toBe(50);
    expect(result.perLeg).toHaveLength(2);
    expect(result.perLeg[0]).toEqual({
      legId: "leg-1",
      questionId: "q1",
      isCorrect: true,
      selectedOptionId: "B",
      correctOptionId: "B",
    });
  });

  it("handles a perfect run", () => {
    const scenario = makeScenario();
    const answers: RadioAnswerMap = {
      q1: buildRadioAnswer(scenario.legs[0]!.question!, "B"),
      q2: buildRadioAnswer(scenario.legs[2]!.question!, "B"),
    };
    const result = buildRadioResult(scenario, answers);
    expect(result.correctAnswers).toBe(2);
    expect(result.percentage).toBe(100);
  });

  it("returns 0% with no answers", () => {
    const result = buildRadioResult(makeScenario(), {});
    expect(result.totalQuestions).toBe(0);
    expect(result.correctAnswers).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("ignores answers for question ids that aren't in the scenario", () => {
    const scenario = makeScenario();
    const answers: RadioAnswerMap = {
      bogus: buildRadioAnswer(makeMcq("bogus"), "B"),
    };
    const result = buildRadioResult(scenario, answers);
    expect(result.totalQuestions).toBe(0);
  });
});
