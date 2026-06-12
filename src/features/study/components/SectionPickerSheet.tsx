"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Section } from "@/content/model/section";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Progress } from "@/shared/ui/progress";
import { groupSectionsByTrack } from "@/features/study/model/sectionTracks";

interface SectionPickerSheetProps {
  sections: Section[];
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
  getCompletionStats: (
    sectionId: string,
    modules: Section["modules"],
  ) => { completed: number; total: number };
}

/**
 * Mobile section picker — collapses the previous horizontal pill scroll
 * into a single tappable trigger that opens a bottom sheet listing every
 * section with its progress bar. One tap to open, one tap to pick.
 *
 * Replaces the old `SectionSelector` on mobile. Desktop layout uses
 * `SectionSelectorGrid` (the existing desktop grid) instead.
 */
export function SectionPickerSheet({
  sections,
  selectedSectionId,
  onSelectSection,
  getCompletionStats,
}: SectionPickerSheetProps) {
  const [open, setOpen] = useState(false);
  const current = sections.find((s) => s.sectionId === selectedSectionId);
  const currentStats = current
    ? getCompletionStats(current.sectionId, current.modules)
    : { completed: 0, total: 0 };

  // Group the sections into pedagogical tracks (Foundations / Planning /
  // Operations / Non-normal / Advanced). Per-track totals roll up at-a-glance
  // progress without having to scan every individual row.
  const tracks = useMemo(() => groupSectionsByTrack(sections), [sections]);
  const trackStats = useMemo(() => {
    return tracks.map(({ track, sections: trackSections }) => {
      let completed = 0;
      let total = 0;
      for (const s of trackSections) {
        const st = getCompletionStats(s.sectionId, s.modules);
        completed += st.completed;
        total += st.total;
      }
      return {
        trackId: track.id,
        completed,
        total,
        percent: total > 0 ? (completed / total) * 100 : 0,
      };
    });
  }, [tracks, getCompletionStats]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-4 py-3",
            "text-left transition-colors hover:border-[var(--ifr-accent)]/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          )}
          aria-label="Browse sections"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--ifr-text-muted)]">
              Section
            </p>
            <p className="truncate text-base font-semibold text-[var(--ifr-text)]">
              {current?.sectionTitle ?? "Pick a section"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-[var(--ifr-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--ifr-text-muted)]">
              {currentStats.completed}/{currentStats.total}
            </span>
            <ChevronDown
              size={16}
              className="text-[var(--ifr-text-muted)]"
              aria-hidden="true"
            />
          </div>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader>
          <SheetTitle>Browse sections</SheetTitle>
        </SheetHeader>
        <div className="pb-2">
          {tracks.map(({ track, sections: trackSections }, trackIndex) => {
            const stats = trackStats[trackIndex];
            return (
              <section key={track.id} className="mt-2 first:mt-0">
                <div className="sticky top-0 z-10 flex items-baseline justify-between gap-2 bg-[var(--ifr-surface)] px-4 pb-1 pt-3">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
                    {track.label}
                  </h3>
                  {stats && stats.total > 0 && (
                    <span className="text-[11px] font-medium text-[var(--ifr-text-muted)]">
                      {stats.completed}/{stats.total}
                    </span>
                  )}
                </div>
                <ul className="divide-y divide-[var(--ifr-border)]" role="list">
                  {trackSections.map((section) => {
                    const sectionStats = getCompletionStats(
                      section.sectionId,
                      section.modules,
                    );
                    const percent =
                      sectionStats.total > 0
                        ? (sectionStats.completed / sectionStats.total) * 100
                        : 0;
                    const isSelected = section.sectionId === selectedSectionId;
                    const isComplete =
                      sectionStats.completed === sectionStats.total &&
                      sectionStats.total > 0;
                    return (
                      <li key={section.sectionId}>
                        <SheetClose asChild>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSection(section.sectionId);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                              "hover:bg-[var(--ifr-surface-muted)]",
                              "focus-visible:outline-none focus-visible:bg-[var(--ifr-surface-muted)]",
                              isSelected && "bg-[var(--ifr-accent)]/5",
                            )}
                            aria-current={isSelected ? "page" : undefined}
                          >
                            <div
                              className={cn(
                                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                isComplete
                                  ? "bg-[var(--ifr-success)]/15 text-[var(--ifr-success)]"
                                  : isSelected
                                    ? "bg-[var(--ifr-accent)]/15 text-[var(--ifr-accent)]"
                                    : "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
                              )}
                              aria-hidden="true"
                            >
                              {isComplete ? <Check size={12} /> : "·"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  className={cn(
                                    "truncate text-sm font-medium",
                                    isSelected
                                      ? "text-[var(--ifr-accent)]"
                                      : "text-[var(--ifr-text)]",
                                  )}
                                >
                                  {section.sectionTitle}
                                </span>
                                <span className="shrink-0 text-[11px] font-medium text-[var(--ifr-text-muted)]">
                                  {sectionStats.completed}/{sectionStats.total}
                                </span>
                              </div>
                              <Progress
                                value={percent}
                                className="mt-2 h-1"
                                aria-label={`${section.sectionTitle} progress`}
                              />
                            </div>
                          </button>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
