"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GoalSelector } from "@/components/GoalSelector";
import { sections } from "@/data/sections";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrill";

export default function Home() {
  const { getCompletionStats } = useProgress();
  const { getWeakCount } = useDrill(sections);

  const totalStats = useMemo(() => {
    const totalModules = sections.reduce((acc, s) => acc + s.modules.length, 0);
    const completedModules = sections.reduce((acc, s) => {
      const stats = getCompletionStats(s.sectionId, s.modules);
      return acc + stats.completed;
    }, 0);
    return { completed: completedModules, total: totalModules };
  }, [getCompletionStats]);

  const weakCount = getWeakCount();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      <div className="mb-8">
        <p className="text-[var(--ifr-text-muted)]">
          Refresh your instrument knowledge with structured modules and adaptive drills.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Select your goal</h2>
        <GoalSelector />
      </section>

      <section className="mb-8 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Progress
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--ifr-text-muted)]">Modules completed</span>
            <span className="font-medium text-foreground">
              {totalStats.completed}/{totalStats.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ifr-text-muted)]">Weak questions</span>
            <span className="font-medium text-[var(--ifr-warning)]">{weakCount}</span>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/study"
          className="flex-1 rounded-lg border border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 px-6 py-3 text-center font-medium text-[var(--ifr-accent)] transition-colors hover:bg-[var(--ifr-accent)]/20"
        >
          Go to Study
        </Link>
        <Link
          href="/drill"
          className="flex-1 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-6 py-3 text-center font-medium text-foreground transition-colors hover:border-[var(--ifr-accent)]/50"
        >
          Go to Drill
        </Link>
      </div>
    </div>
  );
}
