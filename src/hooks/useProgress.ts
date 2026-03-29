"use client";

import { useState, useEffect, useCallback } from "react";
import type { ModuleStatus, ProgressState } from "@/types/progress";
import type { Module } from "@/types/section";

const STORAGE_KEY = "ifrProgress";

function createModuleKey(sectionId: string, moduleId: string): string {
  return `${sectionId}:${moduleId}`;
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when progress changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.error("Failed to save progress to localStorage:", e);
      }
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
