"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/quizScoring";

interface TimerProps {
  timeRemaining: number;
  isRunning: boolean;
  onTimeout: () => void;
  className?: string;
}

export function Timer({ timeRemaining, isRunning, onTimeout, className }: TimerProps) {
  const hasTimedOut = useRef(false);

  // Trigger timeout callback when time hits 0
  useEffect(() => {
    if (timeRemaining <= 0 && isRunning && !hasTimedOut.current) {
      hasTimedOut.current = true;
      onTimeout();
    }
    if (timeRemaining > 0) {
      hasTimedOut.current = false;
    }
  }, [timeRemaining, isRunning, onTimeout]);

  const isLow = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        isCritical && "animate-pulse bg-[var(--ifr-danger)]/10 text-[var(--ifr-danger)]",
        isLow && !isCritical && "bg-[var(--ifr-warning)]/10 text-[var(--ifr-warning)]",
        !isLow && "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
        className
      )}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="tabular-nums">{formatTime(timeRemaining)}</span>
    </div>
  );
}
