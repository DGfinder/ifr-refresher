"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BookmarkCheck } from "lucide-react";
import type { Section } from "@/content/model/section";
import { sections } from "@/content/registry/sections";
import radioCallsSection from "@/content/data/radio-calls.json";
import { useProgress } from "@/features/progress/hooks/useProgress";
import { useDrill } from "@/features/drill";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { Card } from "@/shared/ui/card";
import { RadioProgressSection } from "@/features/progress/components/RadioProgressSection";
import { RADIO_GUIDE_SECTION_ID } from "@/features/radio-calls";
import { getRecentBookmarks, useStudyBookmarks } from "@/features/study";

// Radio-calls phraseology theory isn't in the IFR theory section list any
// more — it lives in /radio?tab=learn. Keep the section locally available
// so bookmarks for radio modules still resolve to a title + a working
// deep-link.
const RADIO_LEARN_SECTION = radioCallsSection as Section;

function getModuleHref(sectionId: string, moduleId: string): string {
  if (sectionId === RADIO_GUIDE_SECTION_ID) {
    return `/radio?tab=learn&module=${encodeURIComponent(moduleId)}`;
  }
  return `/study?section=${encodeURIComponent(sectionId)}&module=${encodeURIComponent(moduleId)}`;
}

export function InsightsScreen() {
  const { getCompletionStats } = useProgress();
  const { getWeakCount, getSeenCount, allQuestions } = useDrill(sections);
  const { bookmarks, isLoaded: bookmarksLoaded } = useStudyBookmarks();

  // Section lookup that includes the radio-calls Learn section so radio
  // bookmarks still surface here (they're saved under the same sectionId
  // as before the move).
  const allBookmarkableSections = useMemo<Section[]>(
    () => [...sections, RADIO_LEARN_SECTION],
    [],
  );

  // Resolve recent bookmarks against the content registry so we can show a
  // readable title + know where to link. Drop entries pointing at content
  // that no longer exists (e.g. after a content rename).
  const recentBookmarks = useMemo(() => {
    if (!bookmarksLoaded) return [];
    const recent = getRecentBookmarks(bookmarks, 6);
    return recent
      .map((b) => {
        const section = allBookmarkableSections.find(
          (s) => s.sectionId === b.sectionId,
        );
        const mod = section?.modules.find((m) => m.id === b.moduleId);
        if (!section || !mod) return null;
        return {
          sectionId: section.sectionId,
          sectionTitle: section.sectionTitle,
          moduleId: mod.id,
          moduleTitle: mod.title,
          savedAt: b.savedAt,
        };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
  }, [bookmarks, bookmarksLoaded, allBookmarkableSections]);

  // Compute stats per section
  const sectionStats = useMemo(() => {
    return sections.map((section) => {
      const stats = getCompletionStats(section.sectionId, section.modules);
      return {
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        completed: stats.completed,
        total: stats.total,
      };
    });
  }, [getCompletionStats]);

  // Compute total stats
  const totalStats = useMemo(() => {
    const totalModules = sections.reduce((acc, s) => acc + s.modules.length, 0);
    const completedModules = sectionStats.reduce((acc, s) => acc + s.completed, 0);
    return { completed: completedModules, total: totalModules };
  }, [sectionStats]);

  const weakCount = getWeakCount();
  const seenCount = getSeenCount();
  const totalQuestions = allQuestions.length;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Insights</h1>

      {/* Overall stats */}
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-lg p-4">
          <p className="text-sm text-[var(--ifr-text-muted)]">Modules completed</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {totalStats.completed}
            <span className="text-base font-normal text-[var(--ifr-text-muted)]">
              /{totalStats.total}
            </span>
          </p>
        </Card>
        <Card className="rounded-lg p-4">
          <p className="text-sm text-[var(--ifr-text-muted)]">Questions seen</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {seenCount}
            <span className="text-base font-normal text-[var(--ifr-text-muted)]">
              /{totalQuestions}
            </span>
          </p>
        </Card>
        <Card className="rounded-lg p-4">
          <p className="text-sm text-[var(--ifr-text-muted)]">Weak questions</p>
          <p className="mt-1 text-2xl font-bold text-[var(--ifr-warning)]">{weakCount}</p>
        </Card>
      </section>

      {/* Section-by-section progress */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Progress by section</h2>
        <div className="space-y-3">
          {sectionStats.map((section) => {
            const percent = section.total > 0 ? (section.completed / section.total) * 100 : 0;
            return (
              <Card key={section.sectionId} className="rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">{section.sectionTitle}</span>
                  <span className="text-sm text-[var(--ifr-text-muted)]">
                    {section.completed}/{section.total}
                  </span>
                </div>
                <ProgressBar value={percent} className="h-2 w-full" aria-label={`${section.sectionTitle} progress`} />
              </Card>
            );
          })}
        </div>
      </section>

      {/* Saved for review — modules the learner explicitly flagged with
          the bookmark heart. Recent first; routes back into the reader. */}
      {recentBookmarks.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Saved for review
          </h2>
          <ul className="space-y-2">
            {recentBookmarks.map((b) => (
              <li key={`${b.sectionId}:${b.moduleId}`}>
                <Link
                  href={getModuleHref(b.sectionId, b.moduleId)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-3 transition-colors hover:border-[var(--ifr-accent)]/40 hover:bg-[var(--ifr-accent)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <BookmarkCheck
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--ifr-accent)]"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[var(--ifr-text)]">
                        {b.moduleTitle}
                      </span>
                      <span className="block truncate text-xs text-[var(--ifr-text-muted)]">
                        {b.sectionTitle}
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-sm text-[var(--ifr-text-muted)]"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Radio progress (drill + scenarios) */}
      <RadioProgressSection />

      {/* CTA for weak focus */}
      {weakCount > 0 && (
        <section>
          <Link
            href="/drill"
            className="inline-block rounded-lg border border-[var(--ifr-warning)] bg-[var(--ifr-warning)]/10 px-6 py-3 text-sm font-medium text-[var(--ifr-warning)] transition-colors hover:bg-[var(--ifr-warning)]/20"
          >
            Review {weakCount} weak question{weakCount !== 1 ? "s" : ""}
          </Link>
        </section>
      )}
    </div>
  );
}
