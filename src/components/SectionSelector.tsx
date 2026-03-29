"use client";

import type { Section } from "@/types/section";
import { cn } from "@/lib/utils";

interface SectionSelectorProps {
  sections: Section[];
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
  getCompletionStats: (
    sectionId: string,
    modules: Section["modules"]
  ) => { completed: number; total: number };
}

export function SectionSelector({
  sections,
  selectedSectionId,
  onSelectSection,
  getCompletionStats,
}: SectionSelectorProps) {
  return (
    <div className="mb-6">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
        {sections.map((section) => {
          const isSelected = section.sectionId === selectedSectionId;
          const stats = getCompletionStats(section.sectionId, section.modules);
          return (
            <button
              key={section.sectionId}
              onClick={() => onSelectSection(section.sectionId)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-[0.75rem] border px-3 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-text)]"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text)] hover:border-[var(--ifr-accent)]/50"
              )}
            >
              <span className="truncate">{section.sectionTitle}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-xs",
                  isSelected
                    ? "bg-[var(--ifr-accent)]/20 text-[var(--ifr-text)]"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {stats.completed}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop: full-width tab buttons with descriptions */}
      <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const isSelected = section.sectionId === selectedSectionId;
          const stats = getCompletionStats(section.sectionId, section.modules);
          return (
            <button
              key={section.sectionId}
              onClick={() => onSelectSection(section.sectionId)}
              className={cn(
                "min-w-[200px] rounded-[0.75rem] border p-4 text-left transition-all",
                isSelected
                  ? "border-[var(--ifr-accent)] border-l-[3px] border-l-[var(--ifr-accent)] bg-[var(--ifr-surface-muted)]"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] hover:border-[var(--ifr-accent)]/50 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--ifr-text-muted)]">
                  {section.sectionTitle}
                </h3>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    stats.completed === stats.total && stats.total > 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {stats.completed}/{stats.total}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--ifr-text-muted)]">
                {section.sectionDescription}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
