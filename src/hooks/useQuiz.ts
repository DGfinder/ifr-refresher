"use client";

import { useState, useCallback, useMemo } from "react";
import type { DrillQuestion, QuizQuestion, QuizOptionId, QuizStats, QuizMode } from "@/types/drill";
import { buildQuizQuestions } from "@/utils/quiz";

interface UseQuizOptions {
  drillQuestions: DrillQuestion[];
  limit?: number;
}

interface UseQuizResult {
  mode: QuizMode;
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  selectedOptionId: QuizOptionId | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  stats: QuizStats;
  selectOption: (optionId: QuizOptionId) => void;
  nextQuestion: () => void;
  restart: () => void;
  start: () => void;
}

export function useQuiz({ drillQuestions, limit = 10 }: UseQuizOptions): UseQuizResult {
  const [mode, setMode] = useState<QuizMode>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<QuizOptionId | null>(null);
  const [stats, setStats] = useState<QuizStats>({
    total: 0,
    answered: 0,
    correct: 0,
    incorrect: 0,
  });

  const currentQuestion = useMemo(() => {
    if (mode !== "in-progress" || currentIndex >= questions.length) return null;
    return questions[currentIndex];
  }, [mode, currentIndex, questions]);

  const isAnswered = selectedOptionId !== null;

  const isCorrect = useMemo(() => {
    if (!isAnswered || !currentQuestion) return null;
    return selectedOptionId === currentQuestion.correctOptionId;
  }, [isAnswered, currentQuestion, selectedOptionId]);

  const start = useCallback(() => {
    const quizQuestions = buildQuizQuestions(drillQuestions, limit);
    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setStats({
      total: quizQuestions.length,
      answered: 0,
      correct: 0,
      incorrect: 0,
    });
    setMode("in-progress");
  }, [drillQuestions, limit]);

  const selectOption = useCallback((optionId: QuizOptionId) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOptionId(optionId);
    const correct = optionId === currentQuestion.correctOptionId;

    setStats((prev) => ({
      ...prev,
      answered: prev.answered + 1,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));
  }, [isAnswered, currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (!isAnswered) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setMode("finished");
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOptionId(null);
    }
  }, [isAnswered, currentIndex, questions.length]);

  const restart = useCallback(() => {
    start();
  }, [start]);

  return {
    mode,
    currentQuestion,
    currentIndex,
    selectedOptionId,
    isAnswered,
    isCorrect,
    stats,
    selectOption,
    nextQuestion,
    restart,
    start,
  };
}
