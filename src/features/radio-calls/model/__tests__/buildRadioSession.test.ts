import { describe, it, expect } from "vitest";
import type { RadioMCQ, RadioReadback, RadioScenario } from "@/content/model/radio";
import {
  buildRadioAnswer,
  buildRadioReadbackAnswer,
  buildRadioResult,
  buildRadioSession,
  evaluateRadioMcq,
  evaluateRadioReadback,
  isRadioSessionOver,
} from "@/features/radio-calls/model/buildRadioSession";
import type { RadioAnswerMap } from "@/features/radio-calls/model/types";

const makeMcq = (id: string): RadioMCQ => ({
  kind: "mcq",
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

const makeReadback = (id: string): RadioReadback => ({
  kind: "readback",
  id,
  prompt: "Pick required readback elements.",
  chips: [
    { id: "alt", text: "Altitude" },
    { id: "sq", text: "Squawk" },
    { id: "cs", text: "Callsign" },
    { id: "wx", text: "Weather (NOT required)" },
  ],
  requiredIds: ["alt", "sq", "cs"],
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
      question: makeReadback("rb1"),
    },
  ],
  refs: [{ source: "AIP GEN 3.4", note: "Test reference" }],
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

describe("evaluateRadioReadback", () => {
  it("is correct when selected chips equal required exactly", () => {
    const out = evaluateRadioReadback(makeReadback("rb1"), ["alt", "sq", "cs"]);
    expect(out.isCorrect).toBe(true);
    expect(out.missingIds).toEqual([]);
    expect(out.extraIds).toEqual([]);
  });

  it("is correct regardless of selection order", () => {
    const out = evaluateRadioReadback(makeReadback("rb1"), ["cs", "alt", "sq"]);
    expect(out.isCorrect).toBe(true);
  });

  it("flags missing required chips", () => {
    const out = evaluateRadioReadback(makeReadback("rb1"), ["alt", "sq"]);
    expect(out.isCorrect).toBe(false);
    expect(out.missingIds).toEqual(["cs"]);
    expect(out.extraIds).toEqual([]);
  });

  it("flags extra (not-required) chips", () => {
    const out = evaluateRadioReadback(makeReadback("rb1"), ["alt", "sq", "cs", "wx"]);
    expect(out.isCorrect).toBe(false);
    expect(out.missingIds).toEqual([]);
    expect(out.extraIds).toEqual(["wx"]);
  });

  it("reports both missing and extra in one go", () => {
    const out = evaluateRadioReadback(makeReadback("rb1"), ["alt", "wx"]);
    expect(out.isCorrect).toBe(false);
    expect(out.missingIds).toEqual(["sq", "cs"]);
    expect(out.extraIds).toEqual(["wx"]);
  });

  it("treats duplicates in selection as a single chip", () => {
    const out = evaluateRadioReadback(makeReadback("rb1"), ["alt", "alt", "sq", "cs"]);
    expect(out.isCorrect).toBe(true);
  });
});

describe("buildRadioAnswer", () => {
  it("builds a tagged mcq answer record", () => {
    const a = buildRadioAnswer(makeMcq("q1"), "B");
    expect(a).toEqual({
      kind: "mcq",
      questionId: "q1",
      selectedOptionId: "B",
      correctOptionId: "B",
      isCorrect: true,
    });
  });

  it("flags an incorrect mcq answer without changing the correct id", () => {
    const a = buildRadioAnswer(makeMcq("q1"), "C");
    if (a.kind !== "mcq") throw new Error("kind drift");
    expect(a.isCorrect).toBe(false);
    expect(a.correctOptionId).toBe("B");
    expect(a.selectedOptionId).toBe("C");
  });
});

describe("buildRadioReadbackAnswer", () => {
  it("builds a tagged readback answer record", () => {
    const a = buildRadioReadbackAnswer(makeReadback("rb1"), ["alt", "sq", "cs"]);
    expect(a.kind).toBe("readback");
    expect(a.questionId).toBe("rb1");
    expect(a.isCorrect).toBe(true);
    if (a.kind === "readback") {
      expect(a.selectedChipIds).toEqual(["alt", "sq", "cs"]);
      expect(a.requiredChipIds).toEqual(["alt", "sq", "cs"]);
    }
  });

  it("preserves selection order in the persisted record", () => {
    const a = buildRadioReadbackAnswer(makeReadback("rb1"), ["cs", "sq", "alt"]);
    if (a.kind !== "readback") throw new Error("kind drift");
    expect(a.selectedChipIds).toEqual(["cs", "sq", "alt"]);
  });

  it("flags an incomplete readback as incorrect", () => {
    const a = buildRadioReadbackAnswer(makeReadback("rb1"), ["alt"]);
    expect(a.isCorrect).toBe(false);
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
  it("aggregates legs of both kinds correctly", () => {
    const scenario = makeScenario();
    const mcq = scenario.legs[0]!.question as RadioMCQ;
    const rb = scenario.legs[2]!.question as RadioReadback;
    const answers: RadioAnswerMap = {
      q1: buildRadioAnswer(mcq, "B"), // correct mcq
      rb1: buildRadioReadbackAnswer(rb, ["alt", "sq"]), // incorrect readback (missing cs)
    };
    const result = buildRadioResult(scenario, answers);
    expect(result.totalQuestions).toBe(2);
    expect(result.correctAnswers).toBe(1);
    expect(result.percentage).toBe(50);
    expect(result.perLeg).toHaveLength(2);
    expect(result.perLeg[0]).toMatchObject({ legId: "leg-1", kind: "mcq", isCorrect: true });
    expect(result.perLeg[1]).toMatchObject({ legId: "leg-3", kind: "readback", isCorrect: false });
  });

  it("handles a perfect run across both kinds", () => {
    const scenario = makeScenario();
    const mcq = scenario.legs[0]!.question as RadioMCQ;
    const rb = scenario.legs[2]!.question as RadioReadback;
    const answers: RadioAnswerMap = {
      q1: buildRadioAnswer(mcq, "B"),
      rb1: buildRadioReadbackAnswer(rb, ["alt", "sq", "cs"]),
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
});
