"use client";

import { useMemo, useState, useEffect } from "react";
import type Fuse from "fuse.js";
import { Check, Clock } from "lucide-react";
import type { Module } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { Badge } from "@/shared/ui/Badge";
import { NoResultsEmptyState } from "@/shared/ui/EmptyState";
import { cn } from "@/shared/lib/cn";

interface ModuleListProps {
  modules: Module[];
  searchQuery: string;
  onSelectModule: (moduleId: string) => void;
  getModuleStatus: (moduleId: string) => ModuleStatus;
}

export function ModuleList({
  modules,
  searchQuery,
  onSelectModule,
  getModuleStatus,
}: ModuleListProps) {
  // Lazy-load fuse.js so the ~7KB gzip only ships when search actually mounts.
  // While the module is in flight we fall back to a case-insensitive substring
  // match so search works on first paint.
  const [fuse, setFuse] = useState<Fuse<Module> | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const FuseCtor = (await import("fuse.js")).default;
      if (cancelled) return;
      setFuse(
        new FuseCtor(modules, {
          keys: ["title", "summary", "tags"],
          threshold: 0.4,
          includeScore: false,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [modules]);

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return modules;
    if (!fuse) {
      const lower = q.toLowerCase();
      return modules.filter(
        (m) =>
          m.title.toLowerCase().includes(lower) ||
          m.summary.toLowerCase().includes(lower) ||
          m.tags.some((t) => t.toLowerCase().includes(lower)),
      );
    }
    return fuse.search(q).map((r) => r.item);
  }, [modules, searchQuery, fuse]);

  if (filteredModules.length === 0) {
    return searchQuery ? (
      <NoResultsEmptyState query={searchQuery} />
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[var(--ifr-text-muted)]">No modules in this category</p>
      </div>
    );
  }

  // Denser list — single column on mobile, two-column on xl. The flat
  // vertical list keeps cards uniform-height and lets the progress dot
  // anchor scanning down the left edge.
  return (
    <ul
      className="grid gap-2 xl:grid-cols-2"
      aria-label="Modules"
    >
      {filteredModules.map((module) => {
        const status = getModuleStatus(module.id);
        return (
          <li key={module.id}>
            <button
              type="button"
              onClick={() => onSelectModule(module.id)}
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
          </li>
        );
      })}
    </ul>
  );
}

interface StatusDotProps {
  status: ModuleStatus;
}

function StatusDot({ status }: StatusDotProps) {
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
