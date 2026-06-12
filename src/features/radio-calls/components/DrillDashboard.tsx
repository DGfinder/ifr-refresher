"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type {
  AirspaceClass,
  RadioDrillCard,
  RadioPhase,
} from "@/content/model/radio";
import { RADIO_PHASES } from "@/content/registry/radioDrillCards";
import {
  getDrillStats,
  getPassedDrillIds,
  type RadioDrillAttempt,
} from "@/features/radio-calls/storage/radioDrillStore";

interface DrillDashboardProps {
  cards: RadioDrillCard[];
  attempts: readonly RadioDrillAttempt[];
  onOpenCard: (drillId: string) => void;
  /** Seed the phase filter on mount — used by the /study guide module
   * deep-links into the Drill tab. Null = "all". */
  initialPhase?: RadioPhase | null;
  /** Seed the airspace class filter on mount. Null = "all". */
  initialClass?: AirspaceClass | null;
}

type PhaseFilter = "all" | RadioPhase;
type ClassFilter = "all" | AirspaceClass;

const CLASS_FILTERS: { id: ClassFilter; label: string; description: string }[] = [
  { id: "all", label: "All", description: "Every airspace" },
  { id: "C", label: "Class C", description: "Capital city major airports" },
  { id: "D", label: "Class D", description: "Regional towered" },
  { id: "E", label: "Class E", description: "En-route controlled" },
  { id: "CTAF", label: "CTAF", description: "Non-towered broadcasts" },
];

export function DrillDashboard({
  cards,
  attempts,
  onOpenCard,
  initialPhase,
  initialClass,
}: DrillDashboardProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>(initialPhase ?? "all");
  const [classFilter, setClassFilter] = useState<ClassFilter>(initialClass ?? "all");
  const [expandedPhases, setExpandedPhases] = useState<ReadonlySet<RadioPhase>>(
    () => new Set([initialPhase ?? "pre-departure"]),
  );

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (phaseFilter !== "all" && c.phase !== phaseFilter) return false;
      if (classFilter !== "all" && c.airspaceClass !== classFilter) return false;
      return true;
    });
  }, [cards, phaseFilter, classFilter]);

  const groupedByPhase = useMemo(() => {
    return RADIO_PHASES.map((phase) => ({
      ...phase,
      cards: filtered.filter((card) => card.phase === phase.id),
    })).filter((phase) => phase.cards.length > 0);
  }, [filtered]);

  const passedIds = useMemo(() => getPassedDrillIds(attempts), [attempts]);
  const passedCount = cards.filter((c) => passedIds.has(c.drillId)).length;

  const selectPhaseFilter = (phase: PhaseFilter) => {
    setPhaseFilter(phase);
    if (phase !== "all") {
      setExpandedPhases((current) => new Set(current).add(phase));
    }
  };

  const togglePhase = (phase: RadioPhase) => {
    setExpandedPhases((current) => {
      const next = new Set(current);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

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
          {passedCount} of {cards.length} passed
        </p>
      </div>

      {/* Airspace class filter chips */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
          Airspace
        </p>
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter drills by airspace class"
        >
          {CLASS_FILTERS.map((c) => {
            const classCards =
              c.id === "all" ? cards : cards.filter((card) => card.airspaceClass === c.id);
            if (c.id !== "all" && classCards.length === 0) return null;
            return (
              <FilterChip
                key={c.id}
                label={c.label}
                title={c.description}
                active={classFilter === c.id}
                count={classCards.length}
                onClick={() => setClassFilter(c.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Phase filter tabs */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
          Flight phase
        </p>
        <div
          className="flex flex-wrap gap-2 overflow-x-auto"
          role="tablist"
          aria-label="Filter drills by flight phase"
        >
          <FilterChip
            label="All"
            active={phaseFilter === "all"}
            count={cards.length}
            onClick={() => selectPhaseFilter("all")}
          />
          {RADIO_PHASES.map((phase) => {
            const phaseCards = cards.filter((c) => c.phase === phase.id);
            if (phaseCards.length === 0) return null;
            return (
              <FilterChip
                key={phase.id}
                label={phase.label}
                active={phaseFilter === phase.id}
                count={phaseCards.length}
                onClick={() => selectPhaseFilter(phase.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-4" aria-label="Drill cards">
        {groupedByPhase.map((phase) => {
          const isExpanded = expandedPhases.has(phase.id);

          return (
            <section
              key={phase.id}
              className="overflow-hidden rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)]"
              aria-labelledby={`drill-phase-${phase.id}`}
            >
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                aria-expanded={isExpanded}
                aria-controls={`drill-phase-list-${phase.id}`}
                className="flex w-full items-center justify-between gap-3 border-b border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] px-4 py-3 text-left transition-colors hover:bg-[var(--ifr-accent)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]"
              >
                <div>
                  <h3
                    id={`drill-phase-${phase.id}`}
                    className="text-sm font-semibold text-[var(--ifr-text)]"
                  >
                    {phase.label}
                  </h3>
                  <p className="text-xs text-[var(--ifr-text-muted)]">
                    {getPhaseDescription(phase.id)}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--ifr-text-muted)]">
                  <span className="rounded-full bg-[var(--ifr-surface)] px-2 py-1">
                    {phase.cards.length} {phase.cards.length === 1 ? "drill" : "drills"}
                  </span>
                  <ChevronRight
                    size={16}
                    className={cn("transition-transform", isExpanded && "rotate-90")}
                    aria-hidden="true"
                  />
                </span>
              </button>
              {isExpanded && (
                <ul
                  id={`drill-phase-list-${phase.id}`}
                  className="divide-y divide-[var(--ifr-border)]"
                  aria-label={`${phase.label} drills`}
                >
                  {phase.cards.map((card) => (
                    <DrillCardRow
                      key={card.drillId}
                      card={card}
                      attempts={attempts}
                      isPassed={passedIds.has(card.drillId)}
                      onOpenCard={onOpenCard}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 text-center text-sm text-[var(--ifr-text-muted)]">
          No drill cards match these filters.
        </p>
      )}
    </div>
  );
}

interface DrillCardRowProps {
  card: RadioDrillCard;
  attempts: readonly RadioDrillAttempt[];
  isPassed: boolean;
  onOpenCard: (drillId: string) => void;
}

function DrillCardRow({ card, attempts, isPassed, onOpenCard }: DrillCardRowProps) {
  const stats = getDrillStats(attempts, card.drillId);
  const tried = stats.totalAttempts > 0;
  // Status: passed (any correct attempt) > attempted-failed-last > untried.
  let status: "passed" | "failed-last" | "untried" = "untried";
  if (isPassed) status = "passed";
  else if (tried && stats.lastIsCorrect === false) status = "failed-last";

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpenCard(card.drillId)}
        className={cn(
          "group flex w-full items-center gap-3 bg-[var(--ifr-surface)] p-4 text-left transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          status === "passed" && "hover:bg-[var(--ifr-success)]/5",
          status === "failed-last" && "hover:bg-[var(--ifr-danger)]/5",
          status === "untried" && "hover:bg-[var(--ifr-accent)]/5",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            status === "passed" && "bg-[var(--ifr-success)]/15 text-[var(--ifr-success)]",
            status === "failed-last" && "bg-[var(--ifr-danger)]/15 text-[var(--ifr-danger)]",
            status === "untried" && "bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)]",
          )}
          aria-hidden="true"
        >
          {status === "passed" && <Check size={14} />}
          {status === "failed-last" && <X size={14} />}
          {status === "untried" && "·"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="truncate font-semibold text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]">
              {card.title}
            </h4>
            <div className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--ifr-text-muted)]">
              {card.airspaceClass && (
                <span className="rounded bg-[var(--ifr-surface-muted)] px-1.5 py-0.5">
                  {card.airspaceClass === "CTAF" ? "CTAF" : `Class ${card.airspaceClass}`}
                </span>
              )}
            </div>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ifr-text-muted)]">
            {card.briefing.summary}
          </p>
          {tried && (
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--ifr-text-muted)]">
              {stats.correctAttempts}/{stats.totalAttempts} correct
              {stats.bestStreak > 1 && ` · best streak ${stats.bestStreak}`}
            </p>
          )}
        </div>
        <ChevronRight
          size={16}
          className="shrink-0 text-[var(--ifr-text-muted)] group-hover:text-[var(--ifr-accent)]"
          aria-hidden="true"
        />
      </button>
    </li>
  );
}

function getPhaseDescription(phase: RadioPhase): string {
  switch (phase) {
    case "pre-departure":
      return "Clearances, ATIS, taxi, line-up, and take-off setup.";
    case "departure":
      return "Initial airborne calls, climb instructions, and SID readbacks.";
    case "enroute":
      return "Centre check-ins, position reports, level changes, and routing.";
    case "arrival":
      return "Approach check-ins, descent, holds, vectors, and clearances.";
    case "final":
      return "Final approach, landing, missed approach, and runway vacating.";
    case "non-normal":
      return "PAN, MAYDAY, lost comms, and cancellation follow-up calls.";
  }
}

interface FilterChipProps {
  label: string;
  title?: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

function FilterChip({ label, title, active, count, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={title}
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
