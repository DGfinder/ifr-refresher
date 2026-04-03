"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { QuizQuestion, QuizOptionId } from "@/types/drill";
import type { Section } from "@/types/section";
import type { ProgramId } from "@/types/programs";
import type {
  QuizPhase,
  QuizGameMode,
  QuizSessionConfig,
  QuizAnswer,
  QuizResult,
} from "@/types/quiz";
import { createInitialSessionState, DEFAULT_SESSION_CONFIG } from "@/types/quiz";
import { buildQuizQuestions } from "@/utils/quiz";
import { calculatePoints, calculatePercentage } from "@/utils/quizScoring";
import { addQuizResult } from "@/utils/quizStorage";
import { useDrill } from "./useDrill";

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
  // Get filtered drill questions for building quiz
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

  // Track question start time for time-based scoring
  const questionStartTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);

  // Current question
  const currentQuestion = useMemo(() => {
    if (phase !== "session" || currentIndex >= questions.length) return null;
    return questions[currentIndex];
  }, [phase, currentIndex, questions]);

  const totalQuestions = questions.length;
  const isAnswered = selectedOptionId !== null;
  const isCorrect = useMemo(() => {
    if (!isAnswered || !currentQuestion) return null;
    return selectedOptionId === currentQuestion.correctOptionId;
  }, [isAnswered, currentQuestion, selectedOptionId]);

  // Calculate percentage
  const percentage = useMemo(() => {
    const correct = answers.filter((a) => a.isCorrect).length;
    return calculatePercentage(correct, answers.length);
  }, [answers]);

  // Update config
  const setConfig = useCallback((updates: Partial<QuizSessionConfig>) => {
    setConfigState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Start a new session
  const startSession = useCallback(() => {
    const limit = config.questionCount === "all" ? undefined : config.questionCount;
    const quizQuestions = buildQuizQuestions(drillQuestions, limit);

    if (quizQuestions.length === 0) return;

    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswers([]);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(config.mode === "challenge" ? 3 : 999);
    setIsPaused(false);
    setFlaggedQuestions(new Set());
    setResult(null);

    // Set timer for timed mode
    if (config.mode === "timed") {
      const timePerQuestion = config.timePerQuestion ?? 30;
      setTimeRemaining(timePerQuestion);
    } else {
      setTimeRemaining(0);
    }

    questionStartTimeRef.current = Date.now();
    sessionStartTimeRef.current = Date.now();
    setPhase("session");
  }, [config, sections, drillQuestions, programId]);

  // Select an option (answer the question)
  const selectOption = useCallback(
    (optionId: QuizOptionId) => {
      if (isAnswered || !currentQuestion) return;

      const timeSpent = Date.now() - questionStartTimeRef.current;
      const correct = optionId === currentQuestion.correctOptionId;

      // Update streak
      const newStreak = correct ? streak + 1 : 0;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }

      // Calculate points
      const points = calculatePoints({
        isCorrect: correct,
        streak: newStreak,
        timeSpentMs: timeSpent,
        mode: config.mode,
      });
      setScore((prev) => prev + points);

      // Handle lives in challenge mode
      if (config.mode === "challenge" && !correct) {
        setLives((prev) => prev - 1);
      }

      // Record answer
      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        correctOptionId: currentQuestion.correctOptionId,
        isCorrect: correct,
        timeSpent,
        skipped: false,
        flagged: flaggedQuestions.has(currentQuestion.id),
      };
      setAnswers((prev) => [...prev, answer]);
      setSelectedOptionId(optionId);
    },
    [isAnswered, currentQuestion, streak, maxStreak, config.mode, flaggedQuestions]
  );

  // Build result object
  const buildResult = useCallback((): QuizResult => {
    const totalTimeSpent = Date.now() - sessionStartTimeRef.current;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const incorrectCount = answers.filter((a) => !a.isCorrect && !a.skipped).length;
    const skippedCount = answers.filter((a) => a.skipped).length;

    // Calculate by section
    const bySection: Record<string, { correct: number; total: number }> = {};
    for (const q of questions) {
      if (!bySection[q.sectionId]) {
        bySection[q.sectionId] = { correct: 0, total: 0 };
      }
      bySection[q.sectionId].total += 1;

      const answer = answers.find((a) => a.questionId === q.id);
      if (answer?.isCorrect) {
        bySection[q.sectionId].correct += 1;
      }
    }

    return {
      id: `quiz-${Date.now()}`,
      mode: config.mode,
      completedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      skippedAnswers: skippedCount,
      score,
      maxStreak,
      timeSpent: totalTimeSpent,
      answers,
      bySection,
    };
  }, [answers, questions, config.mode, score, maxStreak]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    // In learn mode, we don't require an answer
    if (config.mode !== "learn" && !isAnswered) return;

    // Check if game over in challenge mode
    if (config.mode === "challenge" && lives <= 0) {
      const finalResult = buildResult();
      setResult(finalResult);
      addQuizResult(finalResult).catch(console.error);
      setPhase("results");
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      // Quiz complete
      const finalResult = buildResult();
      setResult(finalResult);
      addQuizResult(finalResult).catch(console.error);
      setPhase("results");
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOptionId(null);
      questionStartTimeRef.current = Date.now();

      // Reset timer for timed mode
      if (config.mode === "timed") {
        const timePerQuestion = config.timePerQuestion ?? 30;
        setTimeRemaining(timePerQuestion);
      }
    }
  }, [config.mode, isAnswered, currentIndex, questions.length, lives, buildResult]);

  // Skip question (learn mode or when allowed)
  const skipQuestion = useCallback(() => {
    if (!currentQuestion) return;

    const timeSpent = Date.now() - questionStartTimeRef.current;
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: null,
      correctOptionId: currentQuestion.correctOptionId,
      isCorrect: false,
      timeSpent,
      skipped: true,
      flagged: flaggedQuestions.has(currentQuestion.id),
    };
    setAnswers((prev) => [...prev, answer]);
    setStreak(0);

    // Move to next
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      const finalResult = buildResult();
      setResult(finalResult);
      addQuizResult(finalResult).catch(console.error);
      setPhase("results");
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOptionId(null);
      questionStartTimeRef.current = Date.now();

      if (config.mode === "timed") {
        const timePerQuestion = config.timePerQuestion ?? 30;
        setTimeRemaining(timePerQuestion);
      }
    }
  }, [currentQuestion, flaggedQuestions, currentIndex, questions.length, buildResult, config.mode]);

  // Flag question for review
  const flagQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  }, [currentQuestion]);

  // Pause session
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume session
  const resume = useCallback(() => {
    setIsPaused(false);
    questionStartTimeRef.current = Date.now();
  }, []);

  // End session early
  const endSession = useCallback(() => {
    const finalResult = buildResult();
    setResult(finalResult);
    addQuizResult(finalResult).catch(console.error);
    setPhase("results");
  }, [buildResult]);

  // Reset to dashboard
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

  // Timer timeout handler
  const onTimeout = useCallback(() => {
    // Auto-skip when time runs out
    skipQuestion();
  }, [skipQuestion]);

  return {
    // State
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

    // Computed
    percentage,
    result,

    // Actions
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

    // Timer control
    setTimeRemaining,
    onTimeout,
  };
}
