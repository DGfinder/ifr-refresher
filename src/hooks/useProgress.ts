"use client";

import { useState, useEffect, useCallback } from "react";
import type { ModuleStatus, ProgressState } from "@/types/progress";
import type { Module } from "@/types/section";
import { storage } from "@/lib/storage";

const STORAGE_KEY = "ifrProgress";

function createModuleKey(sectionId: string, moduleId: string): string {
  return `${sectionId}:${moduleId}`;
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.get<ProgressState>(STORAGE_KEY);
        if (stored) {
          setProgress(stored);
        }
      } catch (e) {
        console.error("Failed to load progress from IndexedDB:", e);
      }
      setIsLoaded(true);
    })();
  }, []);

  // Save to IndexedDB when progress changes
  useEffect(() => {
    if (isLoaded) {
      storage.set(STORAGE_KEY, progress).catch((e) => {
        console.error("Failed to save progress to IndexedDB:", e);
      });
    }
  }, [progress, isLoaded]);

  const getStatus = useCallback(
    (sectionId: string, moduleId: string): ModuleStatus => {
      const key = createModuleKey(sectionId, moduleId);
      return progress[key] || "not-started";
    },
    [progress]
  );

  const setStatus = useCallback(
    (sectionId: string, moduleId: string, status: ModuleStatus) => {
      const key = createModuleKey(sectionId, moduleId);
      setProgress((prev) => ({
        ...prev,
        [key]: status,
      }));
    },
    []
  );

  const getCompletionStats = useCallback(
    (
      sectionId: string,
      modules: Module[]
    ): { completed: number; total: number } => {
      let completed = 0;
      for (const module of modules) {
        const key = createModuleKey(sectionId, module.id);
        if (progress[key] === "completed") {
          completed++;
        }
      }
      return { completed, total: modules.length };
    },
    [progress]
  );

  return {
    progress,
    isLoaded,
    getStatus,
    setStatus,
    getCompletionStats,
  };
}
