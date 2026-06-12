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
type DrillTypeGroupId =
  | "clearances"
  | "ground-runway"
  | "checkins-handoffs"
  | "position-reports"
  | "approach-arrival"
  | "atc-instructions"
  | "ctaf-broadcasts"
  | "abnormal-emergency"
  | "services-info";

interface DrillTypeGroup {
  id: DrillTypeGroupId;
  label: string;
  description: string;
}

const CLASS_FILTERS: { id: ClassFilter; label: string; description: string }[] = [
  { id: "all", label: "All", description: "Every airspace" },
  { id: "C", label: "Class C", description: "Capital city major airports" },
  { id: "D", label: "Class D", description: "Regional towered" },
  { id: "E", label: "Class E", description: "En-route controlled" },
  { id: "CTAF", label: "CTAF", description: "Non-towered broadcasts" },
];

const DRILL_TYPE_GROUPS: DrillTypeGroup[] = [
  {
    id: "clearances",
    label: "Clearances",
    description: "IFR clearances, SID clearance readbacks, and amended-route clearance calls.",
  },
  {
    id: "ground-runway",
    label: "Ground & runway",
    description: "Taxi, line-up, take-off, landing, runway crossing, and runway-vacating calls.",
  },
  {
    id: "checkins-handoffs",
    label: "Check-ins & handoffs",
    description: "Initial contact, Centre/Approach check-ins, and frequency-change acknowledgements.",
  },
  {
    id: "position-reports",
    label: "Position & reports",
    description: "Position reports, compulsory reports, estimates, and established/on-course reports.",
  },
  {
    id: "approach-arrival",
    label: "Approach & arrival",
    description: "Descent, holding, vectors, approach clearances, missed approach, and go-around calls.",
  },
  {
    id: "atc-instructions",
    label: "ATC instructions",
    description: "Level, speed, squawk, QNH, direct-routing, WILCO, unable, and say-again calls.",
  },
  {
    id: "ctaf-broadcasts",
    label: "CTAF broadcasts",
    description: "Non-towered taxi, departure, inbound, circuit, overflying, and runway broadcasts.",
  },
  {
    id: "abnormal-emergency",
    label: "Abnormal & emergency",
    description: "PAN, MAYDAY, fuel states, lost comms, TCAS RA, and distress follow-up calls.",
  },
  {
    id: "services-info",
    label: "Services & information",
    description: "ATIS, SARTIME, and other flight-information/service calls.",
  },
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
  const [expandedTypes, setExpandedTypes] = useState<ReadonlySet<DrillTypeGroupId>>(
    () => new Set(["clearances"]),
  );

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (phaseFilter !== "all" && c.phase !== phaseFilter) return false;
      if (classFilter !== "all" && c.airspaceClass !== classFilter) return false;
      return true;
    });
  }, [cards, phaseFilter, classFilter]);

  const groupedByType = useMemo(() => {
    return DRILL_TYPE_GROUPS.map((group) => ({
      ...group,
      cards: filtered.filter((card) => getDrillTypeGroupId(card) === group.id),
    })).filter((group) => group.cards.length > 0);
  }, [filtered]);

  const passedIds = useMemo(() => getPassedDrillIds(attempts), [attempts]);
  const passedCount = cards.filter((c) => passedIds.has(c.drillId)).length;

  const selectPhaseFilter = (phase: PhaseFilter) => {
    setPhaseFilter(phase);
  };

  const toggleTypeGroup = (groupId: DrillTypeGroupId) => {
    setExpandedTypes((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
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
      <div className="space-y-4" aria-label="Drill cards grouped by call type">
        {groupedByType.map((group, index) => {
          const hasExpandedVisibleGroup = groupedByType.some((visibleGroup) =>
            expandedTypes.has(visibleGroup.id),
          );
          const isExpanded = expandedTypes.has(group.id) || (!hasExpandedVisibleGroup && index === 0);

          return (
            <section
              key={group.id}
              className="overflow-hidden rounded-2xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)]"
              aria-labelledby={`drill-type-${group.id}`}
            >
              <button
                type="button"
                onClick={() => toggleTypeGroup(group.id)}
                aria-expanded={isExpanded}
                aria-controls={`drill-type-list-${group.id}`}
                className="flex w-full items-center justify-between gap-3 border-b border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] px-4 py-3 text-left transition-colors hover:bg-[var(--ifr-accent)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]"
              >
                <div>
                  <h3
                    id={`drill-type-${group.id}`}
                    className="text-sm font-semibold text-[var(--ifr-text)]"
                  >
                    {group.label}
                  </h3>
                  <p className="text-xs text-[var(--ifr-text-muted)]">
                    {group.description}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--ifr-text-muted)]">
                  <span className="rounded-full bg-[var(--ifr-surface)] px-2 py-1">
                    {group.cards.length} {group.cards.length === 1 ? "drill" : "drills"}
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
                  id={`drill-type-list-${group.id}`}
                  className="divide-y divide-[var(--ifr-border)]"
                  aria-label={`${group.label} drills`}
                >
                  {group.cards.map((card) => (
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
              <span className="rounded bg-[var(--ifr-surface-muted)] px-1.5 py-0.5">
                {getPhaseLabel(card.phase)}
              </span>
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

function getPhaseLabel(phase: RadioPhase): string {
  switch (phase) {
    case "pre-departure":
      return "Pre-departure";
    case "departure":
      return "Departure";
    case "enroute":
      return "En-route";
    case "arrival":
      return "Arrival";
    case "final":
      return "Final / Landing";
    case "non-normal":
      return "Non-normal";
  }
}

function getDrillTypeGroupId(card: RadioDrillCard): DrillTypeGroupId {
  const tags = card.tags?.map((tag) => tag.toLowerCase()) ?? [];
  const haystack = [card.drillId, card.title, card.briefing.summary, card.challenge.prompt, ...tags]
    .join(" ")
    .toLowerCase();

  if (
    card.airspaceClass === "CTAF" ||
    hasAny(haystack, ["ctaf", "broadcast", "traffic", "circuit", "overflying"])
  ) {
    return "ctaf-broadcasts";
  }

  if (
    hasAny(haystack, [
      "pan-pan",
      "pan pan",
      "mayday",
      "distress",
      "emergency",
      "lost-comms",
      "lost comms",
      "nordo",
      "tcas",
      "resolution advisory",
      "minimum fuel",
      "mayday fuel",
      "rvsm",
      "unable rvsm",
    ])
  ) {
    return "abnormal-emergency";
  }

  if (hasAny(haystack, ["clearance", "sid"])) {
    return "clearances";
  }

  if (
    hasAny(haystack, [
      "taxi",
      "lineup",
      "line-up",
      "takeoff",
      "take-off",
      "landing",
      "cleared to land",
      "runway crossing",
      "crossing runway",
      "vacate",
      "clear of runway",
    ])
  ) {
    return "ground-runway";
  }

  if (hasAny(haystack, ["atis", "sartime", "qnh"])) {
    return "services-info";
  }

  if (hasAny(haystack, ["check-in", "checkin", "handoff", "frequency-change", "frequency change", "contact"])) {
    return "checkins-handoffs";
  }

  if (hasAny(haystack, ["position-report", "position report", "compulsory-report", "compulsory report", "estimate", "established", "report"])) {
    return "position-reports";
  }

  if (
    hasAny(haystack, [
      "approach",
      "arrival",
      "descent",
      "descending",
      "hold",
      "holding",
      "vector",
      "ils",
      "missed approach",
      "go-around",
      "going around",
      "visual approach",
      "cancel ifr",
    ])
  ) {
    return "approach-arrival";
  }

  return "atc-instructions";
}

function hasAny(value: string, needles: readonly string[]): boolean {
  return needles.some((needle) => value.includes(needle));
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
