"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuizProgress, QuizResult } from "@/types/quiz";
import {
  loadQuizProgress,
  saveQuizProgress,
  addQuizResult,
  getQuizStats,
  getRecentHistory,
} from "@/utils/quizStorage";
import { createInitialProgress } from "@/types/quiz";

interface UseQuizProgressReturn {
  progress: QuizProgress;
  stats: ReturnType<typeof getQuizStats>;
  recentHistory: ReturnType<typeof getRecentHistory>;
  addResult: (result: QuizResult) => void;
  isLoaded: boolean;
}

export function useQuizProgress(): UseQuizProgressReturn {
  const [progress, setProgress] = useState<QuizProgress>(createInitialProgress());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const loaded = loadQuizProgress();
    setProgress(loaded);
    setIsLoaded(true);
  }, []);

  // Add a new quiz result
  const addResult = useCallback((result: QuizResult) => {
    const updated = addQuizResult(result);
    setProgress(updated);
  }, []);

  // Computed values
  const stats = getQuizStats();
  const recentHistory = getRecentHistory(5);

  return {
    progress,
    stats,
    recentHistory,
    addResult,
    isLoaded,
  };
}
