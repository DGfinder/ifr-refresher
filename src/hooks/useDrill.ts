"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Section } from "@/types/section";
import type { DrillQuestion, DrillRating, DrillState, DrillStats, DrillFilter } from "@/types/drill";
import type { ProgramId } from "@/types/programs";
import { buildDrillQuestions } from "@/utils/drill";
import { getProgramById } from "@/data/programs";

const STORAGE_KEY = "ifrDrill";

interface UseDrillOptions {
  sectionId?: string | null;
  moduleId?: string | null;
  filter?: DrillFilter;
  programId?: ProgramId;
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

/**
 * Migrate old stats with "qa-N" IDs to new "legacy_qa-N" format
 */
function migrateStats(stats: DrillState): DrillState {
  const migrated: DrillState = {};
  let needsMigration = false;

  for (const [key, value] of Object.entries(stats)) {
    // Check if this is an old format ID (contains :qa- but not :legacy_qa-)
    if (key.includes(":qa-") && !key.includes(":legacy_qa-")) {
      const newKey = key.replace(":qa-", ":legacy_qa-");
      migrated[newKey] = { ...value, questionId: newKey };
      needsMigration = true;
    } else {
      migrated[key] = value;
    }
  }

  return needsMigration ? migrated : stats;
}

export function useDrill(
  sections: Section[],
  options: UseDrillOptions = {}
): UseDrillResult {
  const { sectionId, moduleId, filter, programId } = options;

  const [stats, setStats] = useState<DrillState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load stats from localStorage on mount (with migration)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const migrated = migrateStats(parsed);
        setStats(migrated);
        // Persist migrated stats if changed
        if (migrated !== parsed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
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

  // Filter questions by section, module, program, and DrillFilter
  const filteredQuestions = useMemo(() => {
    let questions = allQuestions;

    // Look up program if programId is provided
    const program = programId ? getProgramById(programId) : undefined;

    // Filter by section (explicit sectionId overrides)
    if (sectionId) {
      questions = questions.filter((q) => q.sectionId === sectionId);
    }

    // Filter by module
    if (moduleId) {
      questions = questions.filter((q) => q.moduleId === moduleId);
    }

    // Merge program filter with explicit filter (explicit overrides)
    const mergedFilter: DrillFilter = {
      ...program?.filter,
      ...filter,
    };

    // Apply merged DrillFilter
    if (mergedFilter.kinds && mergedFilter.kinds.length > 0) {
      questions = questions.filter((q) => mergedFilter.kinds!.includes(q.kind));
    }

    if (mergedFilter.tags && mergedFilter.tags.length > 0) {
      questions = questions.filter((q) =>
        q.tags?.some((tag) => mergedFilter.tags!.includes(tag))
      );
    }

    if (mergedFilter.levels && mergedFilter.levels.length > 0) {
      questions = questions.filter((q) =>
        q.level && mergedFilter.levels!.includes(q.level)
      );
    }

    // Quick Fire Numbers: filter to quick-fire-numbers section only
    if (programId === "quick_fire_numbers") {
      questions = questions.filter((q) => q.sectionId === "quick-fire-numbers");
    }

    // Cheat Sheet: filter to cheat-sheet section only
    if (programId === "cheat_sheet") {
      questions = questions.filter((q) => q.sectionId === "cheat-sheet");
    }

    // Dev console logging
    if (process.env.NODE_ENV === "development" && programId) {
      console.debug("[IFR] Program sizes", {
        programId,
        total: allQuestions.length,
        filtered: questions.length,
        byKind: {
          ipc: allQuestions.filter((q) => q.kind === "ipc").length,
          airline: allQuestions.filter((q) => q.kind === "airline").length,
          legacy_qa: allQuestions.filter((q) => q.kind === "legacy_qa").length,
        },
      });
    }

    return questions;
  }, [allQuestions, sectionId, moduleId, filter, programId]);

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
