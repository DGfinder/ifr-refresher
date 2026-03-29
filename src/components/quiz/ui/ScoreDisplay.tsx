"use client";

import { cn } from "@/lib/utils";
import { getStreakMultiplier } from "@/utils/quizScoring";

interface ScoreDisplayProps {
  score: number;
  streak: number;
  className?: string;
}

export function ScoreDisplay({ score, streak, className }: ScoreDisplayProps) {
  const multiplier = getStreakMultiplier(streak);
  const showMultiplier = multiplier > 1;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-[var(--ifr-text-muted)]">Score:</span>
      <span className="text-lg font-bold tabular-nums text-[var(--ifr-text)]">
        {score.toLocaleString()}
      </span>
      {showMultiplier && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold",
            multiplier >= 4 && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
            multiplier === 3 && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            multiplier === 2 && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          )}
        >
          x{multiplier}
        </span>
      )}
    </div>
  );
}
