"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadRadioDrillHistory,
  recordRadioDrillAttempt,
  type RadioDrillAttempt,
} from "@/features/radio-calls/storage/radioDrillStore";

interface UseRadioDrillHistoryReturn {
  attempts: RadioDrillAttempt[];
  isLoaded: boolean;
  /** Record an attempt and update local state. Returns the new attempts list. */
  recordAttempt: (drillId: string, isCorrect: boolean) => Promise<void>;
}

/**
 * Wraps the per-card drill attempt store. Loads attempts on mount and
 * exposes a `recordAttempt` action that writes-through to storage and
 * updates local state.
 */
export function useRadioDrillHistory(): UseRadioDrillHistoryReturn {
  const [attempts, setAttempts] = useState<RadioDrillAttempt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadRadioDrillHistory();
      if (!cancelled) {
        setAttempts(loaded);
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const recordAttempt = useCallback(async (drillId: string, isCorrect: boolean) => {
    const next = await recordRadioDrillAttempt(drillId, isCorrect);
    setAttempts(next);
  }, []);

  return { attempts, isLoaded, recordAttempt };
}
