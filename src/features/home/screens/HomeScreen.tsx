"use client";

import Link from "next/link";
import { BookOpen, Layers, ClipboardCheck, ArrowUpRight, Route, TrendingUp, ChartNoAxesCombined } from "lucide-react";
import { useMemo } from "react";
import { sections } from "@/content/registry/sections";
import { useProgress } from "@/features/progress";
import { useDrill } from "@/features/drill";
import { ProgressBar } from "@/shared/ui";
import { STUDY_PROGRAMS } from "@/features/programs";

// Cheat sheet is the primary content — show its categories on the homepage
const cheatSheetSection = sections.find((s) => s.sectionId === "cheat-sheet");

export function HomeScreen() {
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
    <div className="workbook-page">
      <header className="mb-8 border-b border-[var(--ifr-border)] pb-8">
        <p className="eyebrow mb-3">Your next session</p>
        <h1 className="workbook-title">Your IFR refresher</h1>
        <p className="workbook-lead">Refresh the principles, practise recalling them, and work through the areas that need another look.</p>
        <Link href="/study?section=cheat-sheet" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--ifr-cta-bg)] px-5 py-2 font-semibold text-[var(--ifr-cta-fg)] hover:bg-[var(--ifr-cta-bg-hover)]">Open the workbook <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </header>

      {/* Progress Summary */}
      {cheatSheetStats.completed > 0 ? (
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
              <span className="text-[var(--ifr-text-muted)]">Cheat sheet reading progress</span>
              <span className="font-medium text-foreground">{progressPercent}%</span>
            </div>
            <ProgressBar value={progressPercent} className="h-2 w-full bg-[var(--ifr-surface-muted)]" aria-label="Cheat sheet reading progress" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
              <div className="text-2xl font-bold text-foreground">
                {cheatSheetStats.completed}/{cheatSheetStats.total}
              </div>
              <div className="text-sm text-[var(--ifr-text-muted)]">Modules read</div>
            </div>
            <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
              <div className="text-2xl font-bold text-[var(--ifr-warning)]">{weakCount}</div>
              <div className="text-sm text-[var(--ifr-text-muted)]">To review (all library)</div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-lg border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 p-5">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            A focused IPC refresher
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ifr-text-muted)]">
            {cheatSheetStats.total} short modules covering selected CASR references, useful numbers,
            and common traps. Works offline — use it at the airport or in the crew room.
          </p>
        </section>
      )}

      {/* Quick Start CTAs */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Start</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/study?section=cheat-sheet"
            className="flex flex-col items-start rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5 text-left transition-colors hover:border-[var(--ifr-accent)]/50"
          >
            <BookOpen className="mb-3 text-[var(--ifr-accent)]" size={24} aria-hidden="true" />
            <span className="font-medium text-foreground">Study</span>
            <span className="mt-1 text-sm text-[var(--ifr-text-muted)]">
              Read explanations and source notes
            </span>
          </Link>
          <Link
            href="/flashcard"
            className="flex flex-col items-start rounded-xl border border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 p-5 text-left transition-colors hover:bg-[var(--ifr-accent)]/20"
          >
            <Layers className="mb-3 text-[var(--ifr-accent)]" size={24} aria-hidden="true" />
            <span className="font-medium text-[var(--ifr-accent)]">Flashcards</span>
            <span className="mt-1 text-sm text-[var(--ifr-text-muted)]">
              Recall an answer, then review it
            </span>
          </Link>
          <Link
            href="/quiz"
            className="flex flex-col items-start rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5 text-left transition-colors hover:border-[var(--ifr-accent)]/50"
          >
            <ClipboardCheck className="mb-3 text-[var(--ifr-accent)]" size={24} aria-hidden="true" />
            <span className="font-medium text-foreground">Quiz</span>
            <span className="mt-1 text-sm text-[var(--ifr-text-muted)]">
              Check your understanding
            </span>
          </Link>
        </div>
      </section>

      <section className="mb-10 workbook-panel overflow-hidden">
        <div className="border-b border-[var(--ifr-border)] p-5 md:p-6">
          <p className="eyebrow mb-2">Learn by changing the example</p>
          <h2 className="text-2xl font-semibold">See the principle at work</h2>
          <p className="mt-2 text-[var(--ifr-text-muted)]">Move a control, follow the diagram, then explain what changed.</p>
        </div>
        <div className="divide-y divide-[var(--ifr-border)]">
          {[{ id: "holding", name: "Holding geometry", detail: "Track, turn direction and the four parts of a hold", Icon: Route }, { id: "approach", name: "Approach guidance", detail: "What 2D and 3D guidance provide", Icon: ChartNoAxesCombined }, { id: "gradient", name: "Gradient & groundspeed", detail: "Why more groundspeed needs more feet per minute", Icon: TrendingUp }].map(({ id, name, detail, Icon }) => <Link key={id} href={`/principles?lesson=${id}`} className="flex items-center gap-4 p-5 hover:bg-[var(--ifr-surface-muted)] md:px-6"><Icon size={24} className="shrink-0 text-[var(--ifr-accent)]" aria-hidden="true" /><span className="flex-1"><span className="block font-semibold">{name}</span><span className="text-sm text-[var(--ifr-text-muted)]">{detail}</span></span><ArrowUpRight size={20} aria-hidden="true" /></Link>)}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Learning pathways</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STUDY_PROGRAMS.filter((program) => program.id !== "cheat_sheet").map((program) => (
            <Link
              key={program.id}
              href={`/flashcard?program=${encodeURIComponent(program.id)}`}
              className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 transition-colors hover:border-[var(--ifr-accent)]/50"
            >
              <div className="font-medium text-foreground">{program.name}</div>
              <p className="mt-1 text-sm leading-snug text-[var(--ifr-text-muted)]">
                {program.description}
              </p>
            </Link>
          ))}
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
                  href={`/study?section=cheat-sheet&category=${encodeURIComponent(category.id)}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 transition-colors hover:border-[var(--ifr-accent)]/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      {category.title}
                    </div>
                    <div className="mt-0.5 text-sm leading-snug text-[var(--ifr-text-muted)]">
                      {category.description}
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
      <footer className="mt-10 border-t border-[var(--ifr-border)] pt-5 text-sm text-[var(--ifr-text-muted)]">Built for deliberate practice. <Link href="/design-system" className="workbook-link">Explore the design system</Link></footer>
    </div>
  );
}
