"use client";

import { useCallback, useMemo, useState } from "react";
import type { RadioOptionId, RadioScenario } from "@/content/model/radio";
import {
  buildRadioAnswer,
  buildRadioResult,
  buildRadioSession,
  isRadioSessionOver,
} from "@/features/radio-calls/model/buildRadioSession";
import type {
  RadioAnswerMap,
  RadioPhase,
  RadioResult,
} from "@/features/radio-calls/model/types";

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
  selectedOptionId: RadioOptionId | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  answers: RadioAnswerMap;
  result: RadioResult | null;

  // actions
  startScenario: (scenarioId: string) => void;
  selectOption: (optionId: RadioOptionId) => void;
  advance: () => void;
  resetToDashboard: () => void;
}

export function useRadioSession({
  scenarios,
}: UseRadioSessionOptions): UseRadioSessionReturn {
  const [phase, setPhase] = useState<RadioPhase>("dashboard");
  const [currentScenario, setCurrentScenario] = useState<RadioScenario | null>(null);
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<RadioOptionId | null>(null);
  const [answers, setAnswers] = useState<RadioAnswerMap>({});
  const [result, setResult] = useState<RadioResult | null>(null);

  const sessionShape = useMemo(() => {
    if (!currentScenario) return null;
    return buildRadioSession(currentScenario);
  }, [currentScenario]);

  const totalLegs = sessionShape?.totalLegs ?? 0;
  const totalQuestions = sessionShape?.totalQuestions ?? 0;

  const currentLeg = currentScenario?.legs[currentLegIndex] ?? null;
  const isAnswered = selectedOptionId !== null;
  const isCorrect = useMemo(() => {
    if (!isAnswered || !currentLeg?.question) return null;
    return selectedOptionId === currentLeg.question.correctOptionId;
  }, [isAnswered, currentLeg, selectedOptionId]);

  const startScenario = useCallback(
    (scenarioId: string) => {
      const scenario = scenarios.find((s) => s.scenarioId === scenarioId);
      if (!scenario) return;
      setCurrentScenario(scenario);
      setCurrentLegIndex(0);
      setSelectedOptionId(null);
      setAnswers({});
      setResult(null);
      setPhase("session");
    },
    [scenarios],
  );

  const selectOption = useCallback(
    (optionId: RadioOptionId) => {
      if (!currentLeg?.question || isAnswered) return;
      const record = buildRadioAnswer(currentLeg.question, optionId);
      setAnswers((prev) => ({ ...prev, [record.questionId]: record }));
      setSelectedOptionId(optionId);
    },
    [currentLeg, isAnswered],
  );

  const advance = useCallback(() => {
    if (!currentScenario) return;
    // For question legs, require an answer before advancing.
    if (currentLeg?.question && !isAnswered) return;

    if (isRadioSessionOver(currentLegIndex, totalLegs)) {
      const finalAnswers = answers;
      const finalResult = buildRadioResult(currentScenario, finalAnswers);
      setResult(finalResult);
      setPhase("results");
      return;
    }

    setCurrentLegIndex((i) => i + 1);
    setSelectedOptionId(null);
  }, [currentScenario, currentLeg, isAnswered, currentLegIndex, totalLegs, answers]);

  const resetToDashboard = useCallback(() => {
    setPhase("dashboard");
    setCurrentScenario(null);
    setCurrentLegIndex(0);
    setSelectedOptionId(null);
    setAnswers({});
    setResult(null);
  }, []);

  return {
    phase,
    scenarios,
    currentScenario,
    currentLegIndex,
    totalLegs,
    totalQuestions,
    selectedOptionId,
    isAnswered,
    isCorrect,
    answers,
    result,
    startScenario,
    selectOption,
    advance,
    resetToDashboard,
  };
}
