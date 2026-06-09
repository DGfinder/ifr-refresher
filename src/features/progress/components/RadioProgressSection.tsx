"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, Radio } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { radioDrillCards } from "@/content/registry/radioDrillCards";
import type { AirspaceClass } from "@/content/model/radio";
import {
  getDrillStats,
  getPassedDrillIds,
  getRecentDrillIds,
  loadRadioDrillHistory,
  loadRadioHistory,
  type RadioDrillAttempt,
  type RadioHistoryEntry,
} from "@/features/radio-calls";
import { ProgressBar } from "@/shared/ui/ProgressBar";

const RECENT_LIMIT = 5;

/**
 * Insights section for the radio calls feature. Pulls per-card attempt
 * history + scenario history through the radio-calls barrel and renders
 * a compact summary: overall mastery, mastery per airspace class, and
 * the five most recent drills.
 */
export function RadioProgressSection() {
  const [drillAttempts, setDrillAttempts] = useState<RadioDrillAttempt[]>([]);
  const [scenarioHistory, setScenarioHistory] = useState<RadioHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [drill, scen] = await Promise.all([
        loadRadioDrillHistory(),
        loadRadioHistory(),
      ]);
      if (!cancelled) {
        setDrillAttempts(drill);
        setScenarioHistory(scen);
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const passedIds = useMemo(() => getPassedDrillIds(drillAttempts), [drillAttempts]);

  const overallStats = useMemo(() => {
    const totalCards = radioDrillCards.length;
    const passed = radioDrillCards.filter((c) => passedIds.has(c.drillId)).length;
    return {
      total: totalCards,
      passed,
      percent: totalCards === 0 ? 0 : (passed / totalCards) * 100,
    };
  }, [passedIds]);

  // Mastery per airspace class — only show classes that have any cards.
  const perClass = useMemo(() => {
    const classes: AirspaceClass[] = ["C", "D", "E", "CTAF"];
    return classes
      .map((cls) => {
        const cardsForClass = radioDrillCards.filter((c) => c.airspaceClass === cls);
        const passedForClass = cardsForClass.filter((c) => passedIds.has(c.drillId)).length;
        return {
          airspaceClass: cls,
          total: cardsForClass.length,
          passed: passedForClass,
          percent: cardsForClass.length === 0 ? 0 : (passedForClass / cardsForClass.length) * 100,
        };
      })
      .filter((entry) => entry.total > 0);
  }, [passedIds]);

  // Most recent drills (de-duped by drillId) with the latest outcome each.
  const recent = useMemo(() => {
    const ids = getRecentDrillIds(drillAttempts, RECENT_LIMIT);
    return ids
      .map((id) => {
        const card = radioDrillCards.find((c) => c.drillId === id);
        if (!card) return null;
        const stats = getDrillStats(drillAttempts, id);
        return { card, stats };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [drillAttempts]);

  // Don't render before history loads — avoids a flash of "0/N passed".
  if (!isLoaded) return null;

  const hasAnyActivity = drillAttempts.length > 0 || scenarioHistory.length > 0;

  return (
    <section className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Radio size={18} aria-hidden="true" />
        Radio calls
      </h2>

      {!hasAnyActivity ? (
        <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-sm text-[var(--ifr-text-muted)]">
          No radio activity yet.{" "}
          <Link
            href="/radio"
            className="font-medium text-[var(--ifr-accent)] hover:underline"
          >
            Start a drill →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall mastery + scenarios completed */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
              <p className="text-sm text-[var(--ifr-text-muted)]">Drill cards passed</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {overallStats.passed}
                <span className="text-base font-normal text-[var(--ifr-text-muted)]">
                  /{overallStats.total}
                </span>
              </p>
              <ProgressBar
                value={overallStats.percent}
                className="mt-2 h-1.5 w-full"
                aria-label="Drill mastery"
              />
            </div>
            <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
              <p className="text-sm text-[var(--ifr-text-muted)]">Scenarios completed</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {scenarioHistory.length}
              </p>
              <p className="mt-2 text-xs text-[var(--ifr-text-muted)]">
                Across the {radioDrillCards.length}-card library + multi-leg scenarios
              </p>
            </div>
          </div>

          {/* Per-airspace mastery */}
          <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
            <p className="mb-3 text-sm font-medium text-foreground">
              Mastery by airspace
            </p>
            <div className="space-y-2.5">
              {perClass.map((entry) => (
                <div key={entry.airspaceClass}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="font-medium text-[var(--ifr-text)]">
                      {entry.airspaceClass === "CTAF"
                        ? "CTAF"
                        : `Class ${entry.airspaceClass}`}
                    </span>
                    <span className="text-[var(--ifr-text-muted)]">
                      {entry.passed}/{entry.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={entry.percent}
                    className="h-1.5 w-full"
                    aria-label={`${entry.airspaceClass} mastery`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          {recent.length > 0 && (
            <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Recent drills</p>
              <ul className="space-y-2 text-sm">
                {recent.map(({ card, stats }) => (
                  <li key={card.drillId} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        stats.lastIsCorrect
                          ? "bg-[var(--ifr-success)]/15 text-[var(--ifr-success)]"
                          : "bg-[var(--ifr-danger)]/15 text-[var(--ifr-danger)]",
                      )}
                      aria-hidden="true"
                    >
                      {stats.lastIsCorrect ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[var(--ifr-text)]">
                      {card.title}
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-[var(--ifr-text-muted)]">
                      {stats.correctAttempts}/{stats.totalAttempts}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/radio"
                className="mt-3 inline-block text-xs font-medium text-[var(--ifr-accent)] hover:underline"
              >
                Open Drill tab →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
