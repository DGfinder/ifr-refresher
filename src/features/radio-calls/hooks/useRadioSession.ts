"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RadioOptionId, RadioScenario } from "@/content/model/radio";
import {
  buildRadioAnswer,
  buildRadioReadbackAnswer,
  buildRadioResult,
  buildRadioSession,
  buildRadioSpokenAnswer,
  isRadioSessionOver,
} from "@/features/radio-calls/model/buildRadioSession";
import type {
  RadioAnswerMap,
  RadioPhase,
  RadioResult,
} from "@/features/radio-calls/model/types";
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
  /** MCQ-only — the option the learner picked on the current leg. */
  selectedOptionId: RadioOptionId | null;
  /** Readback-only — the set of chip ids the learner has toggled on. */
  selectedChipIds: ReadonlySet<string>;
  /** Readback-only — whether the learner has submitted their chip selection. */
  isReadbackSubmitted: boolean;
  /** Spoken-only — the transcript captured for the current leg. */
  spokenTranscript: string;
  /** Spoken-only — whether the learner has submitted their spoken call. */
  isSpokenSubmitted: boolean;
  /** True when the current leg's challenge has been answered (any kind). */
  isAnswered: boolean;
  /** True/false after answering, null before. */
  isCorrect: boolean | null;
  answers: RadioAnswerMap;
  result: RadioResult | null;
  history: RadioHistoryEntry[];

  // actions
  startScenario: (scenarioId: string) => void;
  selectOption: (optionId: RadioOptionId) => void;
  toggleChip: (chipId: string) => void;
  submitReadback: () => void;
  setSpokenTranscript: (transcript: string) => void;
  submitSpokenCall: () => void;
  advance: () => void;
  resetToDashboard: () => void;
}

const EMPTY_CHIPS: ReadonlySet<string> = new Set();

export function useRadioSession({
  scenarios,
}: UseRadioSessionOptions): UseRadioSessionReturn {
  const [phase, setPhase] = useState<RadioPhase>("dashboard");
  const [currentScenario, setCurrentScenario] = useState<RadioScenario | null>(null);
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<RadioOptionId | null>(null);
  const [selectedChipIds, setSelectedChipIds] = useState<ReadonlySet<string>>(EMPTY_CHIPS);
  const [isReadbackSubmitted, setIsReadbackSubmitted] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [isSpokenSubmitted, setIsSpokenSubmitted] = useState(false);
  const [answers, setAnswers] = useState<RadioAnswerMap>({});
  const [result, setResult] = useState<RadioResult | null>(null);
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

  const sessionShape = useMemo(() => {
    if (!currentScenario) return null;
    return buildRadioSession(currentScenario);
  }, [currentScenario]);

  const totalLegs = sessionShape?.totalLegs ?? 0;
  const totalQuestions = sessionShape?.totalQuestions ?? 0;

  const currentLeg = currentScenario?.legs[currentLegIndex] ?? null;
  const currentChallenge = currentLeg?.question;

  const isAnswered = useMemo(() => {
    if (!currentChallenge) return false;
    switch (currentChallenge.kind) {
      case "mcq":
        return selectedOptionId !== null;
      case "readback":
        return isReadbackSubmitted;
      case "spoken":
        return isSpokenSubmitted;
    }
  }, [currentChallenge, selectedOptionId, isReadbackSubmitted, isSpokenSubmitted]);

  const isCorrect = useMemo(() => {
    if (!isAnswered || !currentChallenge) return null;
    const answer = answers[currentChallenge.id];
    return answer ? answer.isCorrect : null;
  }, [isAnswered, currentChallenge, answers]);

  const resetLegInput = useCallback(() => {
    setSelectedOptionId(null);
    setSelectedChipIds(EMPTY_CHIPS);
    setIsReadbackSubmitted(false);
    setSpokenTranscript("");
    setIsSpokenSubmitted(false);
  }, []);

  const startScenario = useCallback(
    (scenarioId: string) => {
      const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
      if (!scenario) return;
      setCurrentScenario(scenario);
      setCurrentLegIndex(0);
      resetLegInput();
      setAnswers({});
      setResult(null);
      setPhase("session");
    },
    [scenarios, resetLegInput],
  );

  const selectOption = useCallback(
    (optionId: RadioOptionId) => {
      if (!currentChallenge || currentChallenge.kind !== "mcq" || isAnswered) return;
      const record = buildRadioAnswer(currentChallenge, optionId);
      setAnswers((prev) => ({ ...prev, [record.questionId]: record }));
      setSelectedOptionId(optionId);
    },
    [currentChallenge, isAnswered],
  );

  const toggleChip = useCallback(
    (chipId: string) => {
      if (!currentChallenge || currentChallenge.kind !== "readback" || isReadbackSubmitted) return;
      setSelectedChipIds((prev) => {
        const next = new Set(prev);
        if (next.has(chipId)) next.delete(chipId);
        else next.add(chipId);
        return next;
      });
    },
    [currentChallenge, isReadbackSubmitted],
  );

  const submitReadback = useCallback(() => {
    if (!currentChallenge || currentChallenge.kind !== "readback" || isReadbackSubmitted) return;
    const record = buildRadioReadbackAnswer(currentChallenge, [...selectedChipIds]);
    setAnswers((prev) => ({ ...prev, [record.questionId]: record }));
    setIsReadbackSubmitted(true);
  }, [currentChallenge, isReadbackSubmitted, selectedChipIds]);

  const submitSpokenCall = useCallback(() => {
    if (!currentChallenge || currentChallenge.kind !== "spoken" || isSpokenSubmitted) return;
    const record = buildRadioSpokenAnswer(currentChallenge, spokenTranscript);
    setAnswers((prev) => ({ ...prev, [record.questionId]: record }));
    setIsSpokenSubmitted(true);
  }, [currentChallenge, isSpokenSubmitted, spokenTranscript]);

  const advance = useCallback(() => {
    if (!currentScenario) return;
    if (currentChallenge && !isAnswered) return;

    if (isRadioSessionOver(currentLegIndex, totalLegs)) {
      const finalResult = buildRadioResult(currentScenario, answers);
      setResult(finalResult);
      setPhase("results");
      addRadioResult(finalResult)
        .then((next) => setHistory(next))
        .catch((err) => console.error("Failed to persist radio result:", err));
      return;
    }

    setCurrentLegIndex((i) => i + 1);
    resetLegInput();
  }, [
    currentScenario,
    currentChallenge,
    isAnswered,
    currentLegIndex,
    totalLegs,
    answers,
    resetLegInput,
  ]);

  const resetToDashboard = useCallback(() => {
    setPhase("dashboard");
    setCurrentScenario(null);
    setCurrentLegIndex(0);
    resetLegInput();
    setAnswers({});
    setResult(null);
  }, [resetLegInput]);

  return {
    phase,
    scenarios,
    currentScenario,
    currentLegIndex,
    totalLegs,
    totalQuestions,
    selectedOptionId,
    selectedChipIds,
    isReadbackSubmitted,
    spokenTranscript,
    isSpokenSubmitted,
    isAnswered,
    isCorrect,
    answers,
    result,
    history,
    startScenario,
    selectOption,
    toggleChip,
    submitReadback,
    setSpokenTranscript,
    submitSpokenCall,
    advance,
    resetToDashboard,
  };
}
