"use client";

import { useCallback, useEffect } from "react";
import type { Card } from "ts-fsrs";
import type { DrillQuestion } from "@/features/drill/model/types";
import { storage } from "@/platform/storage/idbStorage";
import {
  migrateFSRSStore,
  wrapCard,
  type FSRSStore,
} from "@/features/drill/model/fsrsStorage";

const STORAGE_KEY = "ifrFSRS";

type FSRSRating = "again" | "hard" | "good" | "easy";

// Lazy-load ts-fsrs so the ~10KB gzip lives outside the initial drill route
// bundle. Only `rateCard` (and `getCard`'s empty-card fallback) actually need
// the library; the sync helpers (getDueCards / getNewCards) work off the
// already-persisted Card shape and don't need the runtime at all.
type TsFsrsModule = typeof import("ts-fsrs");
type Scheduler = ReturnType<TsFsrsModule["fsrs"]>;

let tsFsrsPromise: Promise<{ mod: TsFsrsModule; scheduler: Scheduler }> | null = null;

function loadTsFsrs() {
  if (!tsFsrsPromise) {
    tsFsrsPromise = import("ts-fsrs").then((mod) => ({
      mod,
      scheduler: mod.fsrs(),
    }));
  }
  return tsFsrsPromise;
}

function ratingToFSRS(mod: TsFsrsModule, rating: FSRSRating): import("ts-fsrs").Grade {
  switch (rating) {
    case "again": return mod.Rating.Again;
    case "hard":  return mod.Rating.Hard;
    case "good":  return mod.Rating.Good;
    case "easy":  return mod.Rating.Easy;
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
    const existing = store[questionId];
    if (existing) return existing.card;
    const { mod } = await loadTsFsrs();
    return mod.createEmptyCard();
  }, []);

  const rateCard = useCallback(async (questionId: string, rating: FSRSRating): Promise<void> => {
    const store = await loadStore();
    const { mod, scheduler } = await loadTsFsrs();
    const existing = store[questionId];
    const card: Card = existing ? existing.card : mod.createEmptyCard();
    const result = scheduler.next(card, new Date(), ratingToFSRS(mod, rating));
    const updated: FSRSStore = { ...store, [questionId]: wrapCard(result.card) };
    await saveStore(updated);
  }, []);

  /**
   * Sync read against the in-memory cache. Returns [] until loadStore() has
   * resolved at least once; callers either await getDueCount() first or
   * accept the empty result during initial hydration. Does not need ts-fsrs
   * at runtime — only reads the already-persisted Card shape.
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
