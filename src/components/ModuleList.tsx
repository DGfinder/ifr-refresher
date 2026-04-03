"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import type { Module } from "@/types/section";
import type { ModuleStatus } from "@/types/progress";
import { Badge } from "./Badge";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

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
  const fuse = useMemo(
    () =>
      new Fuse(modules, {
        keys: ["title", "summary", "tags"],
        threshold: 0.4,
        includeScore: false,
      }),
    [modules]
  );

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    return fuse.search(searchQuery).map((r) => r.item);
  }, [modules, searchQuery, fuse]);

  if (filteredModules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="mb-4 h-12 w-12 text-[var(--ifr-text-muted)]/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-[var(--ifr-text-muted)]">No modules found</p>
        {searchQuery && (
          <p className="mt-1 text-sm text-[var(--ifr-text-muted)]/80">
            Try adjusting your search terms
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {filteredModules.map((module) => {
        const status = getModuleStatus(module.id);
        return (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id)}
            className={cn(
              "group rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-left transition-all",
              "hover:border-[var(--ifr-accent)]/50 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-[var(--ifr-accent)]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <StatusIndicator status={status} className="mt-1 shrink-0" />
                <h3 className="font-semibold text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]">
                  {module.title}
                </h3>
              </div>
              <Badge variant={module.level}>{module.level}</Badge>
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-[var(--ifr-text-muted)] pl-6">
              {module.summary}
            </p>

            <div className="mt-3 flex items-center justify-between pl-6">
              <div className="flex flex-wrap gap-1">
                {module.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--ifr-surface-muted)] px-2 py-0.5 text-xs text-[var(--ifr-text)]"
                  >
                    {tag}
                  </span>
                ))}
                {module.tags.length > 3 && (
                  <span className="text-xs text-[var(--ifr-text-muted)]">
                    +{module.tags.length - 3}
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--ifr-text-muted)]">
                {module.estReadingMinutes} min read
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
