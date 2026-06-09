"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { QuizQuestion, QuizOptionId } from "@/features/drill";
import type { Section } from "@/content/model/section";
import type { ProgramId } from "@/features/programs";
import type {
  QuizPhase,
  QuizSessionConfig,
  QuizAnswer,
  QuizResult,
} from "@/features/quiz/model/types";
import { DEFAULT_SESSION_CONFIG } from "@/features/quiz/model/types";
import { calculatePercentage } from "@/features/quiz/model/scoring";
import {
  buildAnswer,
  buildSessionResult,
  buildSessionStart,
  evaluateAnswer,
  isSessionOver,
  timerForNextQuestion,
} from "@/features/quiz/model/sessionLogic";
import { addQuizResult } from "@/features/quiz/storage/quizHistoryStore";
import { useDrill } from "@/features/drill";

interface UseQuizSessionOptions {
  sections: Section[];
  programId?: ProgramId;
}

interface UseQuizSessionReturn {
  // State
  phase: QuizPhase;
  config: QuizSessionConfig;
  questions: QuizQuestion[];
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: QuizOptionId | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  streak: number;
  maxStreak: number;
  lives: number;
  timeRemaining: number;
  isPaused: boolean;
  answers: QuizAnswer[];
  flaggedQuestions: Set<string>;

  // Computed
  percentage: number;
  result: QuizResult | null;

  // Actions
  setConfig: (config: Partial<QuizSessionConfig>) => void;
  startSession: () => void;
  selectOption: (optionId: QuizOptionId) => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  flagQuestion: () => void;
  pause: () => void;
  resume: () => void;
  endSession: () => void;
  resetToDashboard: () => void;

  // Timer control (for timed mode)
  setTimeRemaining: (time: number) => void;
  onTimeout: () => void;
}

export function useQuizSession({
  sections,
  programId,
}: UseQuizSessionOptions): UseQuizSessionReturn {
  const { filteredQuestions: drillQuestions } = useDrill(sections, { programId });

  // Core state
  const [phase, setPhase] = useState<QuizPhase>("dashboard");
  const [config, setConfigState] = useState<QuizSessionConfig>({ ...DEFAULT_SESSION_CONFIG });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<QuizOptionId | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<QuizResult | null>(null);

  // Refs for time tracking
  const questionStartTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);

  // Derived values
  const currentQuestion = useMemo(() => {
    if (phase !== "session" || currentIndex >= questions.length) return null;
    return questions[currentIndex] ?? null;
  }, [phase, currentIndex, questions]);

  const totalQuestions = questions.length;
  const isAnswered = selectedOptionId !== null;
  const isCorrect = useMemo(() => {
    if (!isAnswered || !currentQuestion) return null;
    return selectedOptionId === currentQuestion.correctOptionId;
  }, [isAnswered, currentQuestion, selectedOptionId]);

  const percentage = useMemo(() => {
    const correct = answers.filter((a) => a.isCorrect).length;
    return calculatePercentage(correct, answers.length);
  }, [answers]);

  const setConfig = useCallback((updates: Partial<QuizSessionConfig>) => {
    setConfigState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Internal: finalise the session, persist the result, and move to results phase.
  const finaliseSession = useCallback(
    (finalAnswers: QuizAnswer[], finalScore: number, finalMaxStreak: number) => {
      const finalResult = buildSessionResult({
        config,
        questions,
        answers: finalAnswers,
        score: finalScore,
        maxStreak: finalMaxStreak,
        sessionStartedAtMs: sessionStartTimeRef.current,
      });
      setResult(finalResult);
      addQuizResult(finalResult).catch(console.error);
      setPhase("results");
    },
    [config, questions],
  );

  const startSession = useCallback(() => {
    const start = buildSessionStart(drillQuestions, config);
    if (!start) return;

    setQuestions(start.questions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(start.startingLives);
    setTimeRemaining(start.startingTimer);
    setIsPaused(false);
    setFlaggedQuestions(new Set());
    setResult(null);

    const now = Date.now();
    questionStartTimeRef.current = now;
    sessionStartTimeRef.current = now;
    setPhase("session");
  }, [config, drillQuestions]);

  const selectOption = useCallback(
    (optionId: QuizOptionId) => {
      if (isAnswered || !currentQuestion) return;

      const timeSpentMs = Date.now() - questionStartTimeRef.current;
      const outcome = evaluateAnswer(currentQuestion, optionId, {
        streak,
        mode: config.mode,
        timeSpentMs,
      });

      setStreak(outcome.newStreak);
      if (outcome.newStreak > maxStreak) setMaxStreak(outcome.newStreak);
      setScore((prev) => prev + outcome.pointsEarned);
      if (outcome.livesDelta !== 0) setLives((prev) => prev + outcome.livesDelta);

      const answer = buildAnswer(currentQuestion, optionId, {
        timeSpentMs,
        skipped: false,
        flagged: flaggedQuestions.has(currentQuestion.id),
      });
      setAnswers((prev) => [...prev, answer]);
      setSelectedOptionId(optionId);
    },
    [isAnswered, currentQuestion, streak, maxStreak, config.mode, flaggedQuestions],
  );

  const advance = useCallback(
    (nextAnswers: QuizAnswer[]) => {
      const sessionOver = isSessionOver({
        mode: config.mode,
        currentIndex,
        totalQuestions: questions.length,
        lives,
      });
      if (sessionOver) {
        finaliseSession(nextAnswers, score, maxStreak);
        return;
      }
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
      questionStartTimeRef.current = Date.now();
      setTimeRemaining(timerForNextQuestion(config));
    },
    [config, currentIndex, questions.length, lives, score, maxStreak, finaliseSession],
  );

  const nextQuestion = useCallback(() => {
    if (config.mode !== "learn" && !isAnswered) return;
    advance(answers);
  }, [config.mode, isAnswered, advance, answers]);

  const skipQuestion = useCallback(() => {
    if (!currentQuestion) return;
    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    const answer = buildAnswer(currentQuestion, null, {
      timeSpentMs,
      skipped: true,
      flagged: flaggedQuestions.has(currentQuestion.id),
    });
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setStreak(0);
    advance(nextAnswers);
  }, [currentQuestion, flaggedQuestions, answers, advance]);

  const flagQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  }, [currentQuestion]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => {
    setIsPaused(false);
    questionStartTimeRef.current = Date.now();
  }, []);

  const endSession = useCallback(() => {
    finaliseSession(answers, score, maxStreak);
  }, [answers, score, maxStreak, finaliseSession]);

  const resetToDashboard = useCallback(() => {
    setPhase("dashboard");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setTimeRemaining(0);
    setIsPaused(false);
    setFlaggedQuestions(new Set());
    setResult(null);
  }, []);

  const onTimeout = useCallback(() => {
    skipQuestion();
  }, [skipQuestion]);

  return {
    phase,
    config,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionId,
    isAnswered,
    isCorrect,
    score,
    streak,
    maxStreak,
    lives,
    timeRemaining,
    isPaused,
    answers,
    flaggedQuestions,
    percentage,
    result,
    setConfig,
    startSession,
    selectOption,
    nextQuestion,
    skipQuestion,
    flagQuestion,
    pause,
    resume,
    endSession,
    resetToDashboard,
    setTimeRemaining,
    onTimeout,
  };
}
