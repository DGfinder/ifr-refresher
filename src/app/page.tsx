"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { sections } from "@/data/sections";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrill";
import { useFSRS } from "@/hooks/useFSRS";
import { getStreakData } from "@/utils/studyStreak";

export default function Home() {
  const { getCompletionStats } = useProgress();
  const { getWeakCount, allQuestions } = useDrill(sections);
  const { getDueCount } = useFSRS();

  const [dueCount, setDueCount] = useState<number>(0);
  const [streak, setStreak] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });

  // Load FSRS due count on mount
  useEffect(() => {
    if (allQuestions.length === 0) return;
    getDueCount(allQuestions).then(setDueCount).catch(console.error);
  }, [allQuestions, getDueCount]);

  // Load streak data on mount
  useEffect(() => {
    getStreakData()
      .then((data) => setStreak({ current: data.currentStreak, longest: data.longestStreak }))
      .catch(console.error);
  }, []);

  const totalStats = useMemo(() => {
    const totalModules = sections.reduce((acc, s) => acc + s.modules.length, 0);
    const completedModules = sections.reduce((acc, s) => {
      const stats = getCompletionStats(s.sectionId, s.modules);
      return acc + stats.completed;
    }, 0);
    return { completed: completedModules, total: totalModules };
  }, [getCompletionStats]);

  const weakCount = getWeakCount();
  const progressPercent = totalStats.total > 0
    ? Math.round((totalStats.completed / totalStats.total) * 100)
    : 0;

  // Streak styling
  const streakStyle =
    streak.current >= 7
      ? "text-orange-400"
      : streak.current >= 3
      ? "text-[var(--ifr-warning)]"
      : "text-foreground";

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-wide uppercase text-foreground mb-1">
          IFR Refresher
        </h1>
        <div className="h-px w-full bg-[rgba(251,191,36,0.4)] mb-4" />
        <p className="text-[var(--ifr-text-muted)]">
          Refresh your instrument knowledge with structured modules and adaptive drills.
        </p>
      </div>

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
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
            <div className="text-2xl font-bold text-foreground">
              {totalStats.completed}/{totalStats.total}
            </div>
            <div className="text-xs text-[var(--ifr-text-muted)]">Modules completed</div>
          </div>
          <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
            <div className="text-2xl font-bold text-[var(--ifr-warning)]">{weakCount}</div>
            <div className="text-xs text-[var(--ifr-text-muted)]">Weak questions</div>
          </div>
          <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
            {dueCount === 0 ? (
              <>
                <div className="text-xl font-bold text-green-500">✓</div>
                <div className="text-xs text-[var(--ifr-text-muted)]">All caught up</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-[var(--ifr-warning)]">{dueCount}</div>
                <div className="text-xs text-[var(--ifr-text-muted)]">Due for review</div>
              </>
            )}
          </div>
          <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
            <div className={`text-2xl font-bold ${streakStyle}`}>
              {streak.current >= 3 ? "🔥" : "📅"} {streak.current}
            </div>
            <div className="text-xs text-[var(--ifr-text-muted)]">Day streak</div>
            {streak.longest > 0 && (
              <div className="text-xs text-[var(--ifr-text-muted)] mt-0.5">
                Best: {streak.longest}d
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Start CTAs */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Start</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/study"
            className="flex flex-col items-center rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5 text-center transition-colors hover:border-[var(--ifr-accent)]/50"
          >
            <span className="mb-2 text-2xl">📖</span>
            <span className="font-medium text-foreground">Study Modules</span>
            <span className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              Read through structured content
            </span>
          </Link>
          <Link
            href="/drill"
            className="flex flex-col items-center rounded-lg border border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 p-5 text-center transition-colors hover:bg-[var(--ifr-accent)]/20"
          >
            <span className="mb-2 text-2xl">🎯</span>
            <span className="font-medium text-[var(--ifr-accent)]">Flashcard Drill</span>
            <span className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              Practice with adaptive cards
            </span>
          </Link>
          <Link
            href="/drill?mode=quiz"
            className="flex flex-col items-center rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5 text-center transition-colors hover:border-[var(--ifr-accent)]/50"
          >
            <span className="mb-2 text-2xl">✅</span>
            <span className="font-medium text-foreground">Quiz Mode</span>
            <span className="mt-1 text-xs text-[var(--ifr-text-muted)]">
              Test your knowledge
            </span>
          </Link>
        </div>
      </section>

      {/* Sections Overview */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Available Sections</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => {
            const stats = getCompletionStats(section.sectionId, section.modules);
            const sectionPercent = stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0;
            return (
              <Link
                key={section.sectionId}
                href={`/study?section=${section.sectionId}`}
                className="flex items-center justify-between rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 transition-colors hover:border-[var(--ifr-accent)]/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground truncate">
                    {section.sectionTitle}
                  </div>
                  <div className="text-xs text-[var(--ifr-text-muted)]">
                    {stats.completed}/{stats.total} modules
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-[var(--ifr-accent)]">
                  {sectionPercent}%
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
