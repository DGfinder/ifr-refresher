"use client";

import { useMemo, useState, useEffect } from "react";
import type Fuse from "fuse.js";
import type { Module } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { NoResultsEmptyState } from "@/shared/ui/EmptyState";
import { ModuleRow } from "./ModuleRow";

interface ModuleListProps {
  modules: Module[];
  searchQuery: string;
  onSelectModule: (moduleId: string) => void;
  getModuleStatus: (moduleId: string) => ModuleStatus;
}

/**
 * Flat module list — used by the desktop layout. Mobile renders modules
 * nested inside each category accordion instead (see CategoryAccordion in
 * StudyScreen).
 */
export function ModuleList({
  modules,
  searchQuery,
  onSelectModule,
  getModuleStatus,
}: ModuleListProps) {
  // Lazy-load fuse.js so the ~7KB gzip only ships when search actually mounts.
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

  return (
    <ul className="grid gap-2 xl:grid-cols-2" aria-label="Modules">
      {filteredModules.map((module) => (
        <li key={module.id}>
          <ModuleRow
            module={module}
            status={getModuleStatus(module.id)}
            onSelect={() => onSelectModule(module.id)}
          />
        </li>
      ))}
    </ul>
  );
}
