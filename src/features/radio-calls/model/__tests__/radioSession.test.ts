import { describe, it, expect } from "vitest";
import type { RadioScenario } from "@/content/model/radio";
import {
  computeIsAnswered,
  computeIsCorrect,
  currentChallenge,
  initialRadioSessionState,
  radioSessionReducer,
} from "@/features/radio-calls/model/radioSession";

const mcqLeg: RadioScenario["legs"][number] = {
  id: "leg-1",
  transmission: { speaker: "atc", text: "make the call" },
  question: {
    kind: "mcq",
    id: "q-1",
    prompt: "Pick the initial call.",
    options: [
      { id: "A", text: "wrong call" },
      { id: "B", text: "correct call" },
    ],
    correctOptionId: "B",
  },
};

const readbackLeg: RadioScenario["legs"][number] = {
  id: "leg-2",
  transmission: { speaker: "atc", text: "your readback" },
  question: {
    kind: "readback",
    id: "q-2",
    prompt: "Read it back.",
    chips: [
      { id: "c1", text: "first" },
      { id: "c2", text: "second" },
      { id: "c3", text: "distractor" },
    ],
    requiredIds: ["c1", "c2"],
  },
};

const spokenLeg: RadioScenario["legs"][number] = {
  id: "leg-3",
  transmission: { speaker: "atc", text: "the cue" },
  question: {
    kind: "spoken",
    id: "q-3",
    prompt: "Say it.",
    expectedText: "tower lima echo foxtrot ready",
    elements: [
      { label: "Tower", accept: ["tower"], required: true },
      { label: "Callsign", accept: ["lima echo foxtrot", "LEF"], required: true },
      { label: "Ready", accept: ["ready"], required: true },
    ],
  },
};

const scenario: RadioScenario = {
  version: "1.0",
  scenarioId: "scen-test",
  title: "Mixed scenario",
  briefing: {
    callsign: "Lima Echo Foxtrot",
    flightRules: "IFR",
    summary: "",
  },
  legs: [mcqLeg, readbackLeg, spokenLeg],
  refs: [{ source: "test" }],
};

describe("radioSessionReducer", () => {
  it("start-scenario transitions to session phase and initialises input for the first leg's kind", () => {
    const next = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    expect(next.phase).toBe("session");
    expect(next.currentLegIndex).toBe(0);
    expect(next.input.kind).toBe("mcq");
    expect(next.answers).toEqual({});
    expect(next.result).toBeNull();
  });

  it("select-option records the answer and stores selectedOptionId", () => {
    const started = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    const answered = radioSessionReducer(started, { type: "select-option", optionId: "B" });
    expect(answered.input).toEqual({ kind: "mcq", selectedOptionId: "B" });
    expect(answered.answers["q-1"]?.isCorrect).toBe(true);
  });

  it("select-option is a no-op after the leg has already been answered", () => {
    const started = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    const first = radioSessionReducer(started, { type: "select-option", optionId: "B" });
    const second = radioSessionReducer(first, { type: "select-option", optionId: "A" });
    expect(second).toBe(first); // identity — no spurious re-render
  });

  it("toggle-chip on the wrong challenge kind is a no-op", () => {
    const started = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    // First leg is MCQ — toggle-chip should be ignored.
    const out = radioSessionReducer(started, { type: "toggle-chip", chipId: "c1" });
    expect(out).toBe(started);
  });

  it("advance moves to the next leg and switches input shape to the next kind", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    state = radioSessionReducer(state, { type: "advance" });
    expect(state.currentLegIndex).toBe(1);
    expect(state.input.kind).toBe("readback");
  });

  it("advance is blocked when the current leg is unanswered", () => {
    const started = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    const out = radioSessionReducer(started, { type: "advance" });
    expect(out).toBe(started);
  });

  it("readback flow: toggle chips → submit → advance", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    state = radioSessionReducer(state, { type: "advance" });
    // Now on the readback leg.
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c1" });
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c2" });
    if (state.input.kind !== "readback") throw new Error("expected readback input");
    expect(state.input.selectedChipIds.has("c1")).toBe(true);
    expect(state.input.selectedChipIds.has("c2")).toBe(true);
    state = radioSessionReducer(state, { type: "submit-readback" });
    if (state.input.kind !== "readback") throw new Error("expected readback input");
    expect(state.input.isSubmitted).toBe(true);
    expect(state.answers["q-2"]?.isCorrect).toBe(true);
  });

  it("spoken flow: set transcript → submit → element-by-element evaluation persists", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    state = radioSessionReducer(state, { type: "advance" });
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c1" });
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c2" });
    state = radioSessionReducer(state, { type: "submit-readback" });
    state = radioSessionReducer(state, { type: "advance" });
    // Now on the spoken leg.
    state = radioSessionReducer(state, {
      type: "set-spoken-transcript",
      transcript: "tower LEF ready",
    });
    state = radioSessionReducer(state, { type: "submit-spoken-call" });
    const answer = state.answers["q-3"];
    if (answer?.kind !== "spoken") throw new Error("expected spoken answer");
    expect(answer.isCorrect).toBe(true);
    expect(answer.hitElementLabels).toContain("Tower");
    expect(answer.hitElementLabels).toContain("Callsign");
    expect(answer.hitElementLabels).toContain("Ready");
  });

  it("advance after the last leg transitions to results and builds the result object", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    state = radioSessionReducer(state, { type: "advance" });
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c1" });
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c2" });
    state = radioSessionReducer(state, { type: "submit-readback" });
    state = radioSessionReducer(state, { type: "advance" });
    state = radioSessionReducer(state, {
      type: "set-spoken-transcript",
      transcript: "tower LEF ready",
    });
    state = radioSessionReducer(state, { type: "submit-spoken-call" });
    state = radioSessionReducer(state, { type: "advance" });
    expect(state.phase).toBe("results");
    expect(state.result).not.toBeNull();
    expect(state.result?.totalQuestions).toBe(3);
  });

  it("reset-to-dashboard returns to the initial state", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    state = radioSessionReducer(state, { type: "reset-to-dashboard" });
    expect(state).toEqual(initialRadioSessionState);
  });
});

describe("radioSession selectors", () => {
  it("currentChallenge returns the active leg's question", () => {
    const state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    expect(currentChallenge(state)?.id).toBe("q-1");
  });

  it("computeIsAnswered switches with the input kind", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    expect(computeIsAnswered(state)).toBe(false);
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    expect(computeIsAnswered(state)).toBe(true);
  });

  it("computeIsCorrect is null pre-answer, boolean post-answer", () => {
    let state = radioSessionReducer(initialRadioSessionState, {
      type: "start-scenario",
      scenario,
    });
    expect(computeIsCorrect(state)).toBeNull();
    state = radioSessionReducer(state, { type: "select-option", optionId: "B" });
    expect(computeIsCorrect(state)).toBe(true);
    state = radioSessionReducer(state, { type: "advance" });
    state = radioSessionReducer(state, { type: "toggle-chip", chipId: "c1" });
    state = radioSessionReducer(state, { type: "submit-readback" });
    // Submitted with only one of two required chips → incorrect.
    expect(computeIsCorrect(state)).toBe(false);
  });
});
