import type { RadioOptionId, RadioScenario } from "@/content/model/radio";
import {
  buildRadioAnswer,
  buildRadioReadbackAnswer,
  buildRadioResult,
  buildRadioSpokenAnswer,
  isRadioSessionOver,
} from "@/features/radio-calls/model/buildRadioSession";
import type {
  RadioAnswerMap,
  RadioPhase,
  RadioResult,
} from "@/features/radio-calls/model/types";

/**
 * Per-kind input state. Tagged so the consumer can pattern-match the
 * UI controls against the active challenge's kind without indexing three
 * parallel slices.
 */
export type RadioInputState =
  | { kind: "none" }
  | { kind: "mcq"; selectedOptionId: RadioOptionId | null }
  | { kind: "readback"; selectedChipIds: ReadonlySet<string>; isSubmitted: boolean }
  | { kind: "spoken"; transcript: string; isSubmitted: boolean };

export interface RadioSessionState {
  phase: RadioPhase;
  currentScenario: RadioScenario | null;
  currentLegIndex: number;
  input: RadioInputState;
  answers: RadioAnswerMap;
  result: RadioResult | null;
}

export const EMPTY_CHIPS: ReadonlySet<string> = new Set();

export const initialRadioSessionState: RadioSessionState = {
  phase: "dashboard",
  currentScenario: null,
  currentLegIndex: 0,
  input: { kind: "none" },
  answers: {},
  result: null,
};

export type RadioSessionAction =
  | { type: "start-scenario"; scenario: RadioScenario }
  | { type: "select-option"; optionId: RadioOptionId }
  | { type: "toggle-chip"; chipId: string }
  | { type: "submit-readback" }
  | { type: "set-spoken-transcript"; transcript: string }
  | { type: "submit-spoken-call" }
  | { type: "advance" }
  | { type: "reset-to-dashboard" };

/**
 * Pure state-transition function. All async I/O (history load, result
 * persistence) is the hook's responsibility — the reducer only computes
 * the next state. Side-effect-free → fully testable without React.
 */
export function radioSessionReducer(
  state: RadioSessionState,
  action: RadioSessionAction,
): RadioSessionState {
  switch (action.type) {
    case "start-scenario": {
      return {
        ...initialRadioSessionState,
        phase: "session",
        currentScenario: action.scenario,
        input: inputForChallengeKind(action.scenario.legs[0]?.question?.kind),
      };
    }

    case "select-option": {
      const challenge = currentChallenge(state);
      if (!challenge || challenge.kind !== "mcq") return state;
      if (state.input.kind !== "mcq" || state.input.selectedOptionId !== null) return state;
      const record = buildRadioAnswer(challenge, action.optionId);
      return {
        ...state,
        input: { kind: "mcq", selectedOptionId: action.optionId },
        answers: { ...state.answers, [record.questionId]: record },
      };
    }

    case "toggle-chip": {
      const challenge = currentChallenge(state);
      if (!challenge || challenge.kind !== "readback") return state;
      if (state.input.kind !== "readback" || state.input.isSubmitted) return state;
      const next = new Set(state.input.selectedChipIds);
      if (next.has(action.chipId)) next.delete(action.chipId);
      else next.add(action.chipId);
      return {
        ...state,
        input: { kind: "readback", selectedChipIds: next, isSubmitted: false },
      };
    }

    case "submit-readback": {
      const challenge = currentChallenge(state);
      if (!challenge || challenge.kind !== "readback") return state;
      if (state.input.kind !== "readback" || state.input.isSubmitted) return state;
      const record = buildRadioReadbackAnswer(challenge, [...state.input.selectedChipIds]);
      return {
        ...state,
        input: { ...state.input, isSubmitted: true },
        answers: { ...state.answers, [record.questionId]: record },
      };
    }

    case "set-spoken-transcript": {
      const challenge = currentChallenge(state);
      if (!challenge || challenge.kind !== "spoken") return state;
      if (state.input.kind !== "spoken" || state.input.isSubmitted) return state;
      return {
        ...state,
        input: { ...state.input, transcript: action.transcript },
      };
    }

    case "submit-spoken-call": {
      const challenge = currentChallenge(state);
      if (!challenge || challenge.kind !== "spoken") return state;
      if (state.input.kind !== "spoken" || state.input.isSubmitted) return state;
      const record = buildRadioSpokenAnswer(challenge, state.input.transcript);
      return {
        ...state,
        input: { ...state.input, isSubmitted: true },
        answers: { ...state.answers, [record.questionId]: record },
      };
    }

    case "advance": {
      if (!state.currentScenario) return state;
      const challenge = currentChallenge(state);
      if (challenge && !computeIsAnswered(state)) return state;

      const totalLegs = state.currentScenario.legs.length;
      if (isRadioSessionOver(state.currentLegIndex, totalLegs)) {
        const finalResult = buildRadioResult(state.currentScenario, state.answers);
        return { ...state, phase: "results", result: finalResult };
      }

      const nextIndex = state.currentLegIndex + 1;
      const nextLeg = state.currentScenario.legs[nextIndex];
      return {
        ...state,
        currentLegIndex: nextIndex,
        input: inputForChallengeKind(nextLeg?.question?.kind),
      };
    }

    case "reset-to-dashboard": {
      return initialRadioSessionState;
    }
  }
}

function inputForChallengeKind(
  kind: "mcq" | "readback" | "spoken" | undefined,
): RadioInputState {
  switch (kind) {
    case "mcq":
      return { kind: "mcq", selectedOptionId: null };
    case "readback":
      return { kind: "readback", selectedChipIds: EMPTY_CHIPS, isSubmitted: false };
    case "spoken":
      return { kind: "spoken", transcript: "", isSubmitted: false };
    default:
      return { kind: "none" };
  }
}

// ─── Selectors ────────────────────────────────────────────────────────────

export function currentLeg(state: RadioSessionState) {
  if (!state.currentScenario) return null;
  return state.currentScenario.legs[state.currentLegIndex] ?? null;
}

export function currentChallenge(state: RadioSessionState) {
  return currentLeg(state)?.question;
}

export function computeIsAnswered(state: RadioSessionState): boolean {
  const challenge = currentChallenge(state);
  if (!challenge) return false;
  switch (state.input.kind) {
    case "mcq":
      return state.input.selectedOptionId !== null;
    case "readback":
      return state.input.isSubmitted;
    case "spoken":
      return state.input.isSubmitted;
    case "none":
      return false;
  }
}

export function computeIsCorrect(state: RadioSessionState): boolean | null {
  if (!computeIsAnswered(state)) return null;
  const challenge = currentChallenge(state);
  if (!challenge) return null;
  const answer = state.answers[challenge.id];
  return answer ? answer.isCorrect : null;
}
