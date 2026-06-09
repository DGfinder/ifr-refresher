"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioDrillCard, RadioPhase } from "@/content/model/radio";
import { RADIO_PHASES } from "@/content/registry/radioDrillCards";

interface DrillDashboardProps {
  cards: RadioDrillCard[];
  completedIds: ReadonlySet<string>;
  onOpenCard: (drillId: string) => void;
}

type PhaseFilter = "all" | RadioPhase;

export function DrillDashboard({ cards, completedIds, onOpenCard }: DrillDashboardProps) {
  const [filter, setFilter] = useState<PhaseFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return cards;
    return cards.filter((c) => c.phase === filter);
  }, [cards, filter]);

  const completedCount = cards.filter((c) => completedIds.has(c.drillId)).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 p-4">
        <p className="text-sm font-semibold text-[var(--ifr-text)]">
          Drill mode
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ifr-text-muted)]">
          Single-card practice — one radio call at a time. Each card frames the
          situation and asks you to make the call. Tap to start; mic and text
          input both work.
        </p>
        <p className="mt-2 text-xs text-[var(--ifr-text-muted)]">
          {completedCount} of {cards.length} attempted
        </p>
      </div>

      {/* Phase filter tabs */}
      <div
        className="flex flex-wrap gap-2 overflow-x-auto"
        role="tablist"
        aria-label="Filter drills by flight phase"
      >
        <PhaseTab
          label="All"
          active={filter === "all"}
          count={cards.length}
          onClick={() => setFilter("all")}
        />
        {RADIO_PHASES.map((phase) => {
          const phaseCards = cards.filter((c) => c.phase === phase.id);
          if (phaseCards.length === 0) return null;
          return (
            <PhaseTab
              key={phase.id}
              label={phase.label}
              active={filter === phase.id}
              count={phaseCards.length}
              onClick={() => setFilter(phase.id)}
            />
          );
        })}
      </div>

      {/* Card list */}
      <ul className="space-y-3" aria-label="Drill cards">
        {filtered.map((card) => {
          const completed = completedIds.has(card.drillId);
          return (
            <li key={card.drillId}>
              <button
                type="button"
                onClick={() => onOpenCard(card.drillId)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border bg-[var(--ifr-surface)] p-4 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                  completed
                    ? "border-[var(--ifr-success)]/30 hover:border-[var(--ifr-success)]/60"
                    : "border-[var(--ifr-border)] hover:border-[var(--ifr-accent)]/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    completed
                      ? "bg-[var(--ifr-success)]/15 text-[var(--ifr-success)]"
                      : "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
                  )}
                  aria-hidden="true"
                >
                  {completed ? <Check size={14} /> : "·"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-semibold text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]">
                      {card.title}
                    </h3>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-[var(--ifr-text-muted)]">
                      {card.phase.replace("-", " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ifr-text-muted)]">
                    {card.briefing.summary}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[var(--ifr-text-muted)] group-hover:text-[var(--ifr-accent)]"
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 text-center text-sm text-[var(--ifr-text-muted)]">
          No drill cards in this phase yet.
        </p>
      )}
    </div>
  );
}

interface PhaseTabProps {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

function PhaseTab({ label, active, count, onClick }: PhaseTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
        active
          ? "border-[var(--ifr-accent)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
          : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] font-semibold",
          active
            ? "bg-[var(--ifr-accent)]/20 text-[var(--ifr-accent)]"
            : "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
        )}
      >
        {count}
      </span>
    </button>
  );
}
