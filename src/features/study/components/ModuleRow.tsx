"use client";

import { Check, Clock } from "lucide-react";
import type { Module } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { Badge } from "@/shared/ui/Badge";
import { cn } from "@/shared/lib/cn";

interface ModuleRowProps {
  module: Module;
  status: ModuleStatus;
  onSelect: () => void;
}

/**
 * Single dense module row — progress dot LEFT, title + 1-line summary,
 * read-time + level badge RIGHT. Used by both the flat `ModuleList`
 * (desktop sidebar) and the nested category accordion (mobile).
 */
export function ModuleRow({ module, status, onSelect }: ModuleRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-3 py-2.5 text-left transition-all",
        "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-surface-muted)]/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
        status === "completed" && "border-[var(--ifr-success)]/20",
      )}
    >
      <StatusDot status={status} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={cn(
              "truncate text-sm font-semibold",
              status === "completed"
                ? "text-[var(--ifr-text-muted)]"
                : "text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]",
            )}
          >
            {module.title}
          </h3>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-[var(--ifr-text-muted)]">
            <Clock size={11} aria-hidden="true" />
            {module.estReadingMinutes} min
            <Badge variant={module.level} className="ml-1 text-[10px]">
              {module.level}
            </Badge>
          </span>
        </div>
        <p className="line-clamp-1 text-xs text-[var(--ifr-text-muted)]">
          {module.summary}
        </p>
      </div>
    </button>
  );
}

function StatusDot({ status }: { status: ModuleStatus }) {
  return (
    <span
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
        status === "completed" &&
          "border-[var(--ifr-success)] bg-[var(--ifr-success)] text-white",
        status === "in-progress" &&
          "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/15",
        status === "not-started" && "border-[var(--ifr-border)] bg-transparent",
      )}
      aria-hidden="true"
    >
      {status === "completed" && <Check size={12} strokeWidth={3} />}
      {status === "in-progress" && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ifr-accent)]" />
      )}
    </span>
  );
}
