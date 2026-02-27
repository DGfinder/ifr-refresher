"use client";

import { cn } from "@/lib/utils";
import type { QuizGameMode } from "@/types/quiz";

interface ModeSelectorProps {
  selectedMode: QuizGameMode;
  onSelectMode: (mode: QuizGameMode) => void;
}

interface ModeOption {
  id: QuizGameMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Standard untimed quiz",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    features: ["No timer", "Streak bonus"],
  },
  {
    id: "timed",
    name: "Timed",
    description: "Race against the clock",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    features: ["30s per question", "Time bonus points"],
  },
  {
    id: "learn",
    name: "Learn",
    description: "Study at your own pace",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    features: ["Show answer option", "No pressure"],
  },
  {
    id: "challenge",
    name: "Challenge",
    description: "Three lives, high stakes",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    features: ["3 lives", "2x points"],
  },
];

export function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--ifr-text-muted)] uppercase tracking-wide">
        Choose Mode
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODE_OPTIONS.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
              selectedMode === mode.id
                ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/5"
                : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] hover:border-[var(--ifr-accent)]/50"
            )}
          >
            {/* Selection indicator */}
            {selectedMode === mode.id && (
              <div className="absolute right-2 top-2">
                <svg className="h-4 w-4 text-[var(--ifr-accent)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div
              className={cn(
                "rounded-lg p-2",
                selectedMode === mode.id
                  ? "bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                  : "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]"
              )}
            >
              {mode.icon}
            </div>

            {/* Name */}
            <span
              className={cn(
                "font-medium",
                selectedMode === mode.id ? "text-[var(--ifr-accent)]" : "text-[var(--ifr-text)]"
              )}
            >
              {mode.name}
            </span>

            {/* Description - hidden on small screens */}
            <span className="hidden text-xs text-[var(--ifr-text-muted)] sm:block">
              {mode.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
