"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Section } from "@/types/section";
import type { DrillQuestion, DrillRating, DrillState, DrillStats } from "@/types/drill";
import { buildDrillQuestions } from "@/utils/drill";

const STORAGE_KEY = "ifrDrill";

interface UseDrillOptions {
  sectionId?: string | null;
  moduleId?: string | null;
}

interface UseDrillResult {
  allQuestions: DrillQuestion[];
  filteredQuestions: DrillQuestion[];
  getNextQuestion: () => DrillQuestion | null;
  stats: DrillState;
  updateRating: (questionId: string, rating: DrillRating) => void;
  getWeakCount: () => number;
  getSeenCount: () => number;
}

export function useDrill(
  sections: Section[],
  options: UseDrillOptions = {}
): UseDrillResult {
  const { sectionId, moduleId } = options;

  const [stats, setStats] = useState<DrillState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsHydrated(true);
  }, []);

  // Persist stats to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore localStorage errors
    }
  }, [stats, isHydrated]);

  // Build all questions from sections
  const allQuestions = useMemo(() => {
    return buildDrillQuestions(sections);
  }, [sections]);

  // Filter questions by section and module
  const filteredQuestions = useMemo(() => {
    let questions = allQuestions;

    if (sectionId) {
      questions = questions.filter((q) => q.sectionId === sectionId);
    }

    if (moduleId) {
      questions = questions.filter((q) => q.moduleId === moduleId);
    }

    return questions;
  }, [allQuestions, sectionId, moduleId]);

  // Update rating for a question
  const updateRating = useCallback((questionId: string, rating: DrillRating) => {
    setStats((prev) => {
      const existing = prev[questionId] || {
        questionId,
        seenCount: 0,
        gotItCount: 0,
        unsureCount: 0,
        lastSeen: "",
      };

      const updated: DrillStats = {
        ...existing,
        seenCount: existing.seenCount + 1,
        gotItCount: existing.gotItCount + (rating === "got-it" ? 1 : 0),
        unsureCount: existing.unsureCount + (rating === "unsure" ? 1 : 0),
        lastSeen: new Date().toISOString(),
      };

      return { ...prev, [questionId]: updated };
    });
  }, []);

  // Get next question using the selection algorithm
  const getNextQuestion = useCallback((): DrillQuestion | null => {
    const candidates = filteredQuestions;
    if (candidates.length === 0) return null;

    // 1. Unseen questions first
    const unseen = candidates.filter(
      (q) => !stats[q.id] || stats[q.id].seenCount === 0
    );
    if (unseen.length > 0) {
      return unseen[Math.floor(Math.random() * unseen.length)];
    }

    // 2. Weak questions (unsure > gotIt)
    const withScores = candidates.map((q) => {
      const s = stats[q.id] || { gotItCount: 0, unsureCount: 0 };
      return { question: q, weakness: s.unsureCount - s.gotItCount };
    });

    const maxWeakness = Math.max(...withScores.map((x) => x.weakness));
    const weakest = withScores.filter((x) => x.weakness === maxWeakness);

    // 3. Random among ties
    return weakest[Math.floor(Math.random() * weakest.length)].question;
  }, [filteredQuestions, stats]);

  // Get count of weak questions (unsure > gotIt)
  const getWeakCount = useCallback((): number => {
    return filteredQuestions.filter((q) => {
      const s = stats[q.id];
      if (!s) return false;
      return s.unsureCount > s.gotItCount;
    }).length;
  }, [filteredQuestions, stats]);

  // Get count of seen questions
  const getSeenCount = useCallback((): number => {
    return filteredQuestions.filter((q) => {
      const s = stats[q.id];
      return s && s.seenCount > 0;
    }).length;
  }, [filteredQuestions, stats]);

  return {
    allQuestions,
    filteredQuestions,
    getNextQuestion,
    stats,
    updateRating,
    getWeakCount,
    getSeenCount,
  };
}
