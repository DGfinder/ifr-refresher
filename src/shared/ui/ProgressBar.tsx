"use client";

import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/cn";

interface ProgressBarProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  "aria-label"?: string;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function ProgressBar({
  value,
  className,
  indicatorClassName,
  "aria-label": ariaLabel = "Progress",
}: ProgressBarProps) {
  const percent = clampPercent(value);

  return (
    <div
      className={cn("overflow-hidden rounded-full bg-[var(--ifr-border)]", className)}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-300 [width:var(--progress-width)]",
          indicatorClassName
        )}
        style={{ "--progress-width": `${percent}%` } as CSSProperties}
      />
    </div>
  );
}
