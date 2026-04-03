"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuizProgress, QuizResult } from "@/types/quiz";
import {
  loadQuizProgress,
  addQuizResult,
  getQuizStats,
  getRecentHistory,
} from "@/utils/quizStorage";
import { createInitialProgress } from "@/types/quiz";

interface UseQuizProgressReturn {
  progress: QuizProgress;
  stats: Awaited<ReturnType<typeof getQuizStats>> | null;
  recentHistory: Awaited<ReturnType<typeof getRecentHistory>> | null;
  addResult: (result: QuizResult) => Promise<void>;
  isLoaded: boolean;
}

export function useQuizProgress(): UseQuizProgressReturn {
  const [progress, setProgress] = useState<QuizProgress>(createInitialProgress());
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getQuizStats>> | null>(null);
  const [recentHistory, setRecentHistory] = useState<Awaited<ReturnType<typeof getRecentHistory>> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadQuizProgress();
      setProgress(loaded);
      const [s, h] = await Promise.all([getQuizStats(), getRecentHistory(5)]);
      setStats(s);
      setRecentHistory(h);
      setIsLoaded(true);
    })();
  }, []);

  // Add a new quiz result
  const addResult = useCallback(async (result: QuizResult) => {
    const updated = await addQuizResult(result);
    setProgress(updated);
    const [s, h] = await Promise.all([getQuizStats(), getRecentHistory(5)]);
    setStats(s);
    setRecentHistory(h);
  }, []);

  return {
    progress,
    stats,
    recentHistory,
    addResult,
    isLoaded,
  };
}
