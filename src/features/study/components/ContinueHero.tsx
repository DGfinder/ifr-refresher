"use client";

import { useMemo } from "react";
import { ArrowRight, Clock } from "lucide-react";
import type { Section } from "@/content/model/section";
import type { ProgressState } from "@/features/progress";
import { cn } from "@/shared/lib/cn";

interface ContinueItem {
  sectionId: string;
  moduleId: string;
  sectionTitle: string;
  moduleTitle: string;
  estReadingMinutes: number;
}

interface ContinueHeroProps {
  sections: Section[];
  progress: ProgressState;
  /** Max items to show. Default 3. */
  limit?: number;
  onResume: (sectionId: string, moduleId: string) => void;
}

/**
 * Surfaces the modules the learner has flagged "in-progress" but not yet
 * completed. Renders nothing if there are none, so it doesn't take space
 * on a fresh /study landing or for a learner who only ever bulk-completes.
 *
 * Insight: most learners read a 5-min module, get interrupted, and then
 * forget where they were. This hero is the resume button they didn't know
 * to look for.
 */
export function ContinueHero({
  sections,
  progress,
  limit = 3,
  onResume,
}: ContinueHeroProps) {
  const items = useMemo<ContinueItem[]>(() => {
    const out: ContinueItem[] = [];
    for (const [key, status] of Object.entries(progress)) {
      if (status !== "in-progress") continue;
      const [sectionId, moduleId] = key.split(":");
      if (!sectionId || !moduleId) continue;
      const section = sections.find((s) => s.sectionId === sectionId);
      if (!section) continue;
      const mod = section.modules.find((m) => m.id === moduleId);
      if (!mod) continue;
      out.push({
        sectionId,
        moduleId,
        sectionTitle: section.sectionTitle,
        moduleTitle: mod.title,
        estReadingMinutes: mod.estReadingMinutes,
      });
      if (out.length >= limit) break;
    }
    return out;
  }, [sections, progress, limit]);

  if (items.length === 0) return null;

  return (
    <section
      className="mb-4 rounded-xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 p-3"
      aria-label="Continue where you left off"
    >
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ifr-accent)]">
        Continue where you left off
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={`${item.sectionId}:${item.moduleId}`}>
            <button
              type="button"
              onClick={() => onResume(item.sectionId, item.moduleId)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg bg-[var(--ifr-surface)] px-3 py-2 text-left",
                "transition-all hover:bg-[var(--ifr-accent)]/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]">
                  {item.moduleTitle}
                </p>
                <p className="truncate text-[11px] text-[var(--ifr-text-muted)]">
                  {item.sectionTitle}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--ifr-text-muted)]">
                <Clock size={11} aria-hidden="true" />
                {item.estReadingMinutes} min
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-[var(--ifr-text-muted)] group-hover:text-[var(--ifr-accent)]"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
