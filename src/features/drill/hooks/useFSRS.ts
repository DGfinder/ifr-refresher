"use client";

import { useCallback, useEffect } from "react";
import { createEmptyCard, fsrs as createFSRS, Rating, type Card, type Grade } from "ts-fsrs";
import type { DrillQuestion } from "@/features/drill/model/types";
import { storage } from "@/platform/storage/idbStorage";
import {
  migrateFSRSStore,
  wrapCard,
  type FSRSStore,
} from "@/features/drill/model/fsrsStorage";

const STORAGE_KEY = "ifrFSRS";

type FSRSRating = "again" | "hard" | "good" | "easy";

const scheduler = createFSRS();

function ratingToFSRS(rating: FSRSRating): Grade {
  switch (rating) {
    case "again": return Rating.Again;
    case "hard":  return Rating.Hard;
    case "good":  return Rating.Good;
    case "easy":  return Rating.Easy;
  }
}

// Module-scoped cache shared across every useFSRS() instance in this tab.
// Invalidated on visibilitychange so re-focusing a tab picks up writes that
// happened in another tab while this one was hidden.
let moduleCache: FSRSStore | null = null;
let pendingLoad: Promise<FSRSStore> | null = null;

async function loadStore(): Promise<FSRSStore> {
  if (moduleCache) return moduleCache;
  if (pendingLoad) return pendingLoad;
  pendingLoad = (async () => {
    try {
      const raw = await storage.get<unknown>(STORAGE_KEY);
      const store = migrateFSRSStore(raw);
      moduleCache = store;
      return store;
    } finally {
      pendingLoad = null;
    }
  })();
  return pendingLoad;
}

async function saveStore(store: FSRSStore): Promise<void> {
  moduleCache = store;
  await storage.set(STORAGE_KEY, store);
}

export function useFSRS() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => {
      if (document.visibilityState === "visible") {
        moduleCache = null;
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const getCard = useCallback(async (questionId: string): Promise<Card> => {
    const store = await loadStore();
    return store[questionId]?.card ?? createEmptyCard();
  }, []);

  const rateCard = useCallback(async (questionId: string, rating: FSRSRating): Promise<void> => {
    const store = await loadStore();
    const card = store[questionId]?.card ?? createEmptyCard();
    const result = scheduler.next(card, new Date(), ratingToFSRS(rating));
    const updated: FSRSStore = { ...store, [questionId]: wrapCard(result.card) };
    await saveStore(updated);
  }, []);

  /**
   * Sync read against the in-memory cache. Returns [] until loadStore() has
   * resolved at least once; callers either await getDueCount() first or
   * accept the empty result during initial hydration.
   */
  const getDueCards = useCallback((allQuestions: DrillQuestion[]): DrillQuestion[] => {
    const store = moduleCache ?? {};
    const now = new Date();
    return allQuestions.filter((q) => {
      const entry = store[q.id];
      if (!entry) return false;
      return new Date(entry.card.due) <= now;
    });
  }, []);

  const getNewCards = useCallback((allQuestions: DrillQuestion[]): DrillQuestion[] => {
    const store = moduleCache ?? {};
    return allQuestions.filter((q) => !store[q.id]);
  }, []);

  const getDueCount = useCallback(async (allQuestions: DrillQuestion[]): Promise<number> => {
    await loadStore();
    return getDueCards(allQuestions).length;
  }, [getDueCards]);

  return { getCard, rateCard, getDueCards, getNewCards, getDueCount };
}
