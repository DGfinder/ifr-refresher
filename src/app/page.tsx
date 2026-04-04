"use client";

import Link from "next/link";
import { useMemo } from "react";
import { sections } from "@/data/sections";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrill";

// Cheat sheet is the primary content — show its categories on the homepage
const cheatSheetSection = sections.find((s) => s.sectionId === "cheat-sheet");

export default function Home() {
  const { getCompletionStats } = useProgress();
  const { getWeakCount } = useDrill(sections);

  // Progress across cheat sheet only (primary content)
  const cheatSheetStats = useMemo(() => {
    if (!cheatSheetSection) return { completed: 0, total: 0 };
    return getCompletionStats(cheatSheetSection.sectionId, cheatSheetSection.modules);
  }, [getCompletionStats]);

  const weakCount = getWeakCount();
  const progressPercent = cheatSheetStats.total > 0
    ? Math.round((cheatSheetStats.completed / cheatSheetStats.total) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      <p className="mb-6 text-[var(--ifr-text-muted)]">
        Study IFR law and procedures for your next instrument rating renewal or IPC.
      </p>

      {/* Progress Summary */}
      <section className="mb-8 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Progress
          </h2>
          <Link
            href="/insights"
            className="text-sm text-[var(--ifr-accent)] hover:underline underline-offset-2"
          >
            View Insights
          </Link>
        </div>
        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-[var(--ifr-text-muted)]">Overall completion</span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--ifr-surface-muted)]">
            <div
              className="h-2 rounded-full bg-[var(--ifr-accent)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
            <div className="text-2xl font-bold text-foreground">
              {cheatSheetStats.completed}/{cheatSheetStats.total}
            </div>
            <div className="text-xs text-[var(--ifr-text-muted)]">Modules completed</div>
          </div>
          <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
            <div className="text-2xl font-bold text-[var(--ifr-warning)]">{weakCount}</div>
            <div className="text-xs text-[var(--ifr-text-muted)]">Weak questions</div>
          </div>
        </div>
      </section>

      {/* Quick Start CTAs */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Start</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/study?section=cheat-sheet"
            className="flex flex-col items-center rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5 text-center transition-colors hover:border-[var(--ifr-accent)]/50"
          >
            <span className="mb-2 text-2xl">📖</span>
            <span className="font-medium text-foreground">Study</span>
            <span className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              Read the law and procedures
            </span>
          </Link>
          <Link
            href="/flashcard"
            className="flex flex-col items-center rounded-lg border border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 p-5 text-center transition-colors hover:bg-[var(--ifr-accent)]/20"
          >
            <span className="mb-2 text-2xl">🎯</span>
            <span className="font-medium text-[var(--ifr-accent)]">Flashcards</span>
            <span className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              Drill with adaptive cards
            </span>
          </Link>
          <Link
            href="/quiz"
            className="flex flex-col items-center rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5 text-center transition-colors hover:border-[var(--ifr-accent)]/50"
          >
            <span className="mb-2 text-2xl">✅</span>
            <span className="font-medium text-foreground">Quiz</span>
            <span className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              Test under pressure
            </span>
          </Link>
        </div>
      </section>

      {/* Cheat sheet categories — primary entry points */}
      {cheatSheetSection && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Topics</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cheatSheetSection.categories.map((category) => {
              const categoryModules = cheatSheetSection.modules.filter((m) =>
                category.moduleIds.includes(m.id)
              );
              const completed = categoryModules.filter(
                (m) => getCompletionStats(cheatSheetSection.sectionId, [m]).completed > 0
              ).length;
              const pct = categoryModules.length > 0
                ? Math.round((completed / categoryModules.length) * 100)
                : 0;
              return (
                <Link
                  key={category.id}
                  href={`/study?section=cheat-sheet`}
                  className="flex items-center justify-between rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 transition-colors hover:border-[var(--ifr-accent)]/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      {category.title}
                    </div>
                    <div className="text-xs text-[var(--ifr-text-muted)]">
                      {categoryModules.length} module{categoryModules.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="ml-4 text-sm font-medium text-[var(--ifr-accent)]">
                    {pct}%
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
