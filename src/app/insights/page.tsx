"use client";

import { useMemo } from "react";
import Link from "next/link";
import { sections } from "@/data/sections";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrill";

export default function InsightsPage() {
  const { getCompletionStats } = useProgress();
  const { getWeakCount, getSeenCount, allQuestions } = useDrill(sections);

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
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <p className="text-sm text-[var(--ifr-text-muted)]">Modules completed</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {totalStats.completed}
            <span className="text-base font-normal text-[var(--ifr-text-muted)]">
              /{totalStats.total}
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <p className="text-sm text-[var(--ifr-text-muted)]">Questions seen</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {seenCount}
            <span className="text-base font-normal text-[var(--ifr-text-muted)]">
              /{totalQuestions}
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <p className="text-sm text-[var(--ifr-text-muted)]">Weak questions</p>
          <p className="mt-1 text-2xl font-bold text-[var(--ifr-warning)]">{weakCount}</p>
        </div>
      </section>

      {/* Section-by-section progress */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Progress by section</h2>
        <div className="space-y-3">
          {sectionStats.map((section) => {
            const percent = section.total > 0 ? (section.completed / section.total) * 100 : 0;
            return (
              <div
                key={section.sectionId}
                className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">{section.sectionTitle}</span>
                  <span className="text-sm text-[var(--ifr-text-muted)]">
                    {section.completed}/{section.total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--ifr-border)]">
                  <div
                    className="h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
