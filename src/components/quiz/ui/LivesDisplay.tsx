"use client";

import { cn } from "@/lib/utils";

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
  className?: string;
}

export function LivesDisplay({ lives, maxLives = 3, className }: LivesDisplayProps) {
  const hearts = Array.from({ length: maxLives }, (_, i) => i < lives);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {hearts.map((isAlive, index) => (
        <span
          key={index}
          className={cn(
            "text-lg transition-all duration-300",
            isAlive ? "scale-100 opacity-100" : "scale-75 opacity-30 grayscale"
          )}
        >
          {isAlive ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}
