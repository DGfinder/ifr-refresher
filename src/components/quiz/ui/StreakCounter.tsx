"use client";

import { cn } from "@/lib/utils";
import { isStreakMilestone } from "@/utils/quizScoring";

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  if (streak === 0) return null;

  const isMilestone = isStreakMilestone(streak);
  const isHot = streak >= 5;
  const isOnFire = streak >= 10;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition-all",
        isOnFire && "bg-gradient-to-r from-orange-500 to-red-500 text-white",
        isHot && !isOnFire && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        !isHot && "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
        isMilestone && "animate-bounce",
        className
      )}
    >
      <span
        className={cn(
          "transition-transform",
          isOnFire && "animate-pulse",
          isHot && "scale-110"
        )}
      >
        {isOnFire ? "🔥" : isHot ? "🔥" : "✨"}
      </span>
      <span>{streak}</span>
      {isMilestone && streak >= 5 && (
        <span className="text-xs opacity-75">streak!</span>
      )}
    </div>
  );
}
