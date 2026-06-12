"use client";

import { useCallback, useEffect, useState } from "react";
import type { Card } from "ts-fsrs";
import {
  loadRadioDrillFSRS,
  saveRadioDrillFSRS,
  wrapFSRSCard,
  type RadioDrillFSRSStore,
} from "@/features/radio-calls/storage/radioDrillFSRSStore";

type FSRSRating = "again" | "good";

// Lazy-load ts-fsrs so the gzipped scheduler stays out of the initial /radio
// bundle. Only `scheduleNext` actually needs the runtime; selectors work off
// the already-persisted Card shape and don't need the library at all.
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

function ratingToFSRS(
  mod: TsFsrsModule,
  rating: FSRSRating,
): import("ts-fsrs").Grade {
  // Binary rating per drill outcome:
  //  - isCorrect → "good"   (review interval grows)
  //  - !isCorrect → "again" (back to learning, short interval)
  //
  // Could grow into a richer rating later (hard / easy based on element-miss
  // count from the spoken matcher) — left as future work.
  return rating === "good" ? mod.Rating.Good : mod.Rating.Again;
}

interface UseRadioDrillFSRSReturn {
  store: RadioDrillFSRSStore;
  isLoaded: boolean;
  scheduleNext: (drillId: string, isCorrect: boolean) => Promise<void>;
}

/**
 * Spaced-repetition layer for the radio drill library. Wires each attempt
 * through the ts-fsrs scheduler so cards bubble back at the right interval.
 */
export function useRadioDrillFSRS(): UseRadioDrillFSRSReturn {
  const [store, setStore] = useState<RadioDrillFSRSStore>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadRadioDrillFSRS();
      if (!cancelled) {
        setStore(loaded);
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scheduleNext = useCallback(
    async (drillId: string, isCorrect: boolean): Promise<void> => {
      const { mod, scheduler } = await loadTsFsrs();
      const existing = store[drillId];
      const card: Card = existing ? existing.card : mod.createEmptyCard();
      const result = scheduler.next(
        card,
        new Date(),
        ratingToFSRS(mod, isCorrect ? "good" : "again"),
      );
      const next: RadioDrillFSRSStore = {
        ...store,
        [drillId]: wrapFSRSCard(result.card),
      };
      setStore(next);
      await saveRadioDrillFSRS(next);
    },
    [store],
  );

  return { store, isLoaded, scheduleNext };
}
