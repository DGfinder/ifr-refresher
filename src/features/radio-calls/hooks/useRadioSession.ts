"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { RadioOptionId, RadioScenario } from "@/content/model/radio";
import type {
  RadioAnswerMap,
  RadioPhase,
  RadioResult,
} from "@/features/radio-calls/model/types";
import {
  computeIsAnswered,
  computeIsCorrect,
  EMPTY_CHIPS,
  initialRadioSessionState,
  radioSessionReducer,
} from "@/features/radio-calls/model/radioSession";
import {
  addRadioResult,
  loadRadioHistory,
  type RadioHistoryEntry,
} from "@/features/radio-calls/storage/radioHistoryStore";

interface UseRadioSessionOptions {
  scenarios: RadioScenario[];
}

interface UseRadioSessionReturn {
  phase: RadioPhase;
  scenarios: RadioScenario[];
  currentScenario: RadioScenario | null;
  currentLegIndex: number;
  totalLegs: number;
  totalQuestions: number;
  /** MCQ-only — null when the current input isn't an MCQ. */
  selectedOptionId: RadioOptionId | null;
  /** Readback-only — empty set when the current input isn't a readback. */
  selectedChipIds: ReadonlySet<string>;
  /** Readback-only — false when the current input isn't a readback. */
  isReadbackSubmitted: boolean;
  /** Spoken-only — empty when the current input isn't a spoken call. */
  spokenTranscript: string;
  /** Spoken-only — false when the current input isn't a spoken call. */
  isSpokenSubmitted: boolean;
  /** True when the current leg's challenge has been answered (any kind). */
  isAnswered: boolean;
  /** True/false after answering, null before. */
  isCorrect: boolean | null;
  answers: RadioAnswerMap;
  result: RadioResult | null;
  history: RadioHistoryEntry[];

  startScenario: (scenarioId: string) => void;
  selectOption: (optionId: RadioOptionId) => void;
  toggleChip: (chipId: string) => void;
  submitReadback: () => void;
  setSpokenTranscript: (transcript: string) => void;
  submitSpokenCall: (transcript?: string) => void;
  advance: () => void;
  resetToDashboard: () => void;
}

/**
 * Thin wrapper around the pure `radioSessionReducer`. The hook owns only
 * async I/O — history load on mount + result persistence on transition into
 * the results phase. All state transitions live in the reducer, fully
 * testable without React.
 */
export function useRadioSession({
  scenarios,
}: UseRadioSessionOptions): UseRadioSessionReturn {
  const [state, dispatch] = useReducer(radioSessionReducer, initialRadioSessionState);
  const [history, setHistory] = useState<RadioHistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadRadioHistory();
      if (!cancelled) setHistory(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist the result when the session transitions into the results phase.
  useEffect(() => {
    if (state.phase !== "results" || !state.result) return;
    const result = state.result;
    let cancelled = false;
    addRadioResult(result)
      .then((next) => {
        if (!cancelled) setHistory(next);
      })
      .catch((err) => console.error("Failed to persist radio result:", err));
    return () => {
      cancelled = true;
    };
    // We intentionally key on the result id, not the result object — the
    // session might re-enter results for the same outcome (e.g. tab refocus
    // restoring state) and we don't want to double-persist.
  }, [state.phase, state.result]);

  const totalLegs = state.currentScenario?.legs.length ?? 0;
  const totalQuestions = useMemo(
    () => state.currentScenario?.legs.filter((l) => l.question).length ?? 0,
    [state.currentScenario],
  );

  const isAnswered = computeIsAnswered(state);
  const isCorrect = computeIsCorrect(state);

  // Decompose the tagged input back into the per-kind slices the UI consumes.
  const selectedOptionId =
    state.input.kind === "mcq" ? state.input.selectedOptionId : null;
  const selectedChipIds =
    state.input.kind === "readback" ? state.input.selectedChipIds : EMPTY_CHIPS;
  const isReadbackSubmitted =
    state.input.kind === "readback" ? state.input.isSubmitted : false;
  const spokenTranscript = state.input.kind === "spoken" ? state.input.transcript : "";
  const isSpokenSubmitted =
    state.input.kind === "spoken" ? state.input.isSubmitted : false;

  return {
    phase: state.phase,
    scenarios,
    currentScenario: state.currentScenario,
    currentLegIndex: state.currentLegIndex,
    totalLegs,
    totalQuestions,
    selectedOptionId,
    selectedChipIds,
    isReadbackSubmitted,
    spokenTranscript,
    isSpokenSubmitted,
    isAnswered,
    isCorrect,
    answers: state.answers,
    result: state.result,
    history,
    startScenario: (scenarioId) => {
      const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
      if (scenario) dispatch({ type: "start-scenario", scenario });
    },
    selectOption: (optionId) => dispatch({ type: "select-option", optionId }),
    toggleChip: (chipId) => dispatch({ type: "toggle-chip", chipId }),
    submitReadback: () => dispatch({ type: "submit-readback" }),
    setSpokenTranscript: (transcript) =>
      dispatch({ type: "set-spoken-transcript", transcript }),
    submitSpokenCall: (transcript) =>
      dispatch(
        transcript === undefined
          ? { type: "submit-spoken-call" }
          : { type: "submit-spoken-call", transcript },
      ),
    advance: () => dispatch({ type: "advance" }),
    resetToDashboard: () => dispatch({ type: "reset-to-dashboard" }),
  };
}
