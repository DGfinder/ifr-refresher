"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { sections } from "@/data/sections";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrill";

const FEATURES = [
  {
    emoji: "📖",
    title: "Cheat Sheet",
    description: "Structured study modules covering every IFR topic — regulations, procedures, minima, and more.",
    href: "/study",
    badge: null,
  },
  {
    emoji: "🎯",
    title: "Flashcards",
    description: "Adaptive spaced repetition. New cards first, weak spots surfaced until you own them.",
    href: "/flashcard",
    badge: "Popular",
    highlight: true,
  },
  {
    emoji: "✅",
    title: "Quiz Mode",
    description: "Timed, challenge, and learn modes. Track your scores and crush your weak topics.",
    href: "/quiz",
    badge: null,
  },
  {
    emoji: "⚡",
    title: "Quick-Fire Drills",
    description: "Rapid numeric recall — altimetry, fuel reserves, holding speeds. Commit the numbers to memory.",
    href: "/flashcard",
    badge: null,
  },
];

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
  const progressPercent = totalStats.total > 0
    ? Math.round((totalStats.completed / totalStats.total) * 100)
    : 0;

  // Animate progress bar in on mount
  const [animatedPercent, setAnimatedPercent] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedPercent(progressPercent), 150);
    return () => clearTimeout(t);
  }, [progressPercent]);

  const isFreshStart = totalStats.completed === 0;

  const hasStarted = totalStats.completed > 0 || weakCount > 0;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">

      {/* Hero */}
      <div className="mb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--ifr-accent)]">
          <span>⚡</span>
          <span>Open Source · Australian IFR · No login required</span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-foreground mb-3 md:text-5xl">
          Pass Your IFR Theory.
          <br />
          <span className="text-[var(--ifr-accent)]">Study Smarter, Not Harder.</span>
        </h1>
        <p className="text-[var(--ifr-text-muted)] max-w-xl text-base md:text-lg">
          Built by Australian pilots, for Australian pilots. Everything you need to nail your IPC oral — from Part 61 regs to approach minima.
        </p>

        {/* Quick stats */}
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-[var(--ifr-text-muted)]">
            <span className="font-semibold text-foreground">{sections.length}</span> study sections
          </div>
          <div className="text-[var(--ifr-border)]">·</div>
          <div className="flex items-center gap-1.5 text-[var(--ifr-text-muted)]">
            <span className="font-semibold text-foreground">{totalStats.total}</span> modules
          </div>
          <div className="text-[var(--ifr-border)]">·</div>
          <div className="flex items-center gap-1.5 text-[var(--ifr-text-muted)]">
            <span className="font-semibold text-foreground">3</span> study programs
          </div>
          <div className="text-[var(--ifr-border)]">·</div>
          <div className="flex items-center gap-1.5 text-[var(--ifr-text-muted)]">
            <span className="font-semibold text-foreground">Offline-first</span> PWA
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--ifr-accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[var(--ifr-accent)]/90 active:scale-[0.98] dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <span>📖</span>
            Start Studying
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-6 py-3 text-base font-semibold text-foreground transition-all hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-surface-muted)] active:scale-[0.98]"
          >
            <span>✅</span>
            Quiz Me
          </Link>
          <a
            href="https://github.com/DGfinder/ifr-refresher"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--ifr-border)] px-4 py-3 text-sm text-[var(--ifr-text-muted)] transition-colors hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>

      {/* Progress Summary (only show if user has started) */}
      {hasStarted && (
        <section className="mb-8 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your Progress
            </h2>
            <Link
              href="/insights"
              className="text-sm text-[var(--ifr-accent)] hover:underline underline-offset-2"
            >
              View Insights →
            </Link>
          </div>
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[var(--ifr-text-muted)]">Overall completion</span>
              <span className="font-medium text-foreground">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--ifr-surface-muted)]">
              <div
                className="h-2 rounded-full bg-[var(--ifr-accent)] transition-all duration-700 ease-out"
                style={{ width: `${animatedPercent}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
              <div className="text-2xl font-bold text-foreground">
                {totalStats.completed}/{totalStats.total}
              </div>
              <div className="text-xs text-[var(--ifr-text-muted)]">Modules completed</div>
            </div>
            <div className="rounded-lg bg-[var(--ifr-surface-muted)] p-3 text-center">
              <div className="text-2xl font-bold text-[var(--ifr-warning)]">{weakCount}</div>
              <div className="text-xs text-[var(--ifr-text-muted)]">Cards to review</div>
            </div>
          </div>
        </section>
      )}

      {/* Feature callouts */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-foreground">How You&apos;ll Study</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href + feature.title}
              href={feature.href}
              className={`group relative flex flex-col rounded-xl border p-5 transition-all hover:shadow-sm ${
                feature.highlight
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/5 hover:bg-[var(--ifr-accent)]/10"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] hover:border-[var(--ifr-accent)]/40"
              }`}
            >
              {feature.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-[var(--ifr-accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {feature.badge}
                </span>
              )}
              <span className="mb-3 text-3xl">{feature.emoji}</span>
              <span className={`mb-1 font-semibold ${feature.highlight ? "text-[var(--ifr-accent)]" : "text-foreground"}`}>
                {feature.title}
              </span>
              <span className="text-xs leading-relaxed text-[var(--ifr-text-muted)]">
                {feature.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Sections Overview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">All Study Sections</h2>
          <Link
            href="/study"
            className="text-sm text-[var(--ifr-accent)] hover:underline underline-offset-2"
          >
            Browse all →
          </Link>
        </div>
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
                className="flex items-center justify-between rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 transition-all hover:border-[var(--ifr-accent)]/40 hover:bg-[var(--ifr-surface-muted)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground truncate">
                    {section.sectionTitle}
                  </div>
                  <div className="text-xs text-[var(--ifr-text-muted)] mt-0.5">
                    {stats.total} module{stats.total !== 1 ? "s" : ""}
                    {sectionPercent > 0 && ` · ${sectionPercent}% done`}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {sectionPercent === 100 ? (
                    <span className="text-sm text-[var(--ifr-success)]">✓</span>
                  ) : sectionPercent > 0 ? (
                    <span className="text-sm font-medium text-[var(--ifr-accent)]">{sectionPercent}%</span>
                  ) : (
                    <span className="text-xs text-[var(--ifr-text-muted)]">Start →</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer attribution */}
      <footer className="mt-10 border-t border-[var(--ifr-border)] pt-6 text-center text-xs text-[var(--ifr-text-muted)]">
        <p>
          Cheat sheet content derived from the{" "}
          <span className="text-foreground font-medium">We Fly Planes IFR Cheat Sheet v7.1</span>{" "}
          by Ben Montgomery-Schinkel.{" "}
          <a
            href="https://github.com/DGfinder/ifr-refresher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ifr-accent)] hover:underline"
          >
            Open source on GitHub
          </a>
          . Use as a study aid only — always verify against current AIP.
        </p>
      </footer>
    </div>
  );
}
