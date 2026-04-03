"use client";

import { useCallback, useRef } from "react";
import { createEmptyCard, fsrs as createFSRS, Rating, type Card, type Grade } from "ts-fsrs";
import type { DrillQuestion } from "@/types/drill";
import { storage } from "@/lib/storage";

const STORAGE_KEY = "ifrFSRS";

type FSRSRating = 'again' | 'hard' | 'good' | 'easy';

type FSRSStore = Record<string, Card>;

const scheduler = createFSRS();

function ratingToFSRS(rating: FSRSRating): Grade {
  switch (rating) {
    case 'again': return Rating.Again;
    case 'hard':  return Rating.Hard;
    case 'good':  return Rating.Good;
    case 'easy':  return Rating.Easy;
  }
}

export function useFSRS() {
  // In-memory cache to avoid repeated IDB reads within a session
  const cacheRef = useRef<FSRSStore | null>(null);

  const loadStore = useCallback(async (): Promise<FSRSStore> => {
    if (cacheRef.current) return cacheRef.current;
    const stored = await storage.get<FSRSStore>(STORAGE_KEY);
    const store = stored ?? {};
    cacheRef.current = store;
    return store;
  }, []);

  const saveStore = useCallback(async (store: FSRSStore): Promise<void> => {
    cacheRef.current = store;
    await storage.set(STORAGE_KEY, store);
  }, []);

  const getCard = useCallback(async (questionId: string): Promise<Card> => {
    const store = await loadStore();
    return store[questionId] ?? createEmptyCard();
  }, [loadStore]);

  const rateCard = useCallback(async (questionId: string, rating: FSRSRating): Promise<void> => {
    const store = await loadStore();
    const card = store[questionId] ?? createEmptyCard();
    const result = scheduler.next(card, new Date(), ratingToFSRS(rating));
    const updated = { ...store, [questionId]: result.card };
    await saveStore(updated);
  }, [loadStore, saveStore]);

  /**
   * Returns questions where the FSRS card is due now (or past due).
   * Uses in-memory cache so it's synchronous after first load.
   */
  const getDueCards = useCallback((allQuestions: DrillQuestion[]): DrillQuestion[] => {
    const store = cacheRef.current ?? {};
    const now = new Date();
    return allQuestions.filter((q) => {
      const card = store[q.id];
      if (!card) return false; // new card, not due yet
      return new Date(card.due) <= now;
    });
  }, []);

  /**
   * Returns questions with no FSRS card yet (never seen in FSRS mode).
   */
  const getNewCards = useCallback((allQuestions: DrillQuestion[]): DrillQuestion[] => {
    const store = cacheRef.current ?? {};
    return allQuestions.filter((q) => !store[q.id]);
  }, []);

  return { getCard, rateCard, getDueCards, getNewCards };
}
