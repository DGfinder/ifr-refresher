"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Flame,
  Play,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
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
  getRecentAttempts,
  getDailyAttemptStreak,
  type RadioDrillAttempt,
} from "@/features/radio-calls/storage/radioDrillStore";
import {
  getDueDrillIds,
  getScheduleState,
  type RadioDrillFSRSStore,
} from "@/features/radio-calls/storage/radioDrillFSRSStore";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

interface DrillDashboardProps {
  cards: RadioDrillCard[];
  attempts: readonly RadioDrillAttempt[];
  fsrsStore: RadioDrillFSRSStore;
  onOpenCard: (drillId: string) => void;
  /** Kick off a guided session — RadioScreen advances the learner through
   * the queue without dropping back to the dashboard between cards. */
  onStartSession: (cards: RadioDrillCard[]) => void;
  /** Seed the phase filter on mount — used by the /study guide module
   * deep-links into the Drill tab. Null = "all". */
  initialPhase?: RadioPhase | null;
  /** Seed the airspace class filter on mount. Null = "all". */
  initialClass?: AirspaceClass | null;
}

type PhaseFilter = "all" | RadioPhase;
type ClassFilter = "all" | AirspaceClass;
type ScheduleFilter = "all" | "due" | "new";
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

const SESSION_SIZE = 10;

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

interface CuratedPath {
  id: string;
  label: string;
  description: string;
  filter: { phase: PhaseFilter; airspaceClass: ClassFilter };
}

/**
 * Hand-picked entry points. Each tap snaps the filter chips to a coherent
 * slice of the library instead of asking the learner to combine
 * phase + airspace themselves. Designed to cover the four practical
 * starting points most pilots reach for: tower work, IFR clearance flow,
 * non-towered, and emergencies.
 */
const CURATED_PATHS: CuratedPath[] = [
  {
    id: "class-d-circuit",
    label: "Class D circuit work",
    description: "Taxi, takeoff, downwind, landing",
    filter: { phase: "all", airspaceClass: "D" },
  },
  {
    id: "class-c-ifr-flow",
    label: "Class C IFR flow",
    description: "Clearance, SID, climb, handoffs",
    filter: { phase: "all", airspaceClass: "C" },
  },
  {
    id: "ctaf",
    label: "CTAF non-towered",
    description: "Broadcasts, AFRU, traffic picture",
    filter: { phase: "all", airspaceClass: "CTAF" },
  },
  {
    id: "emergency",
    label: "Emergency cold-call",
    description: "PAN, MAYDAY, lost comms, TCAS RA",
    filter: { phase: "non-normal", airspaceClass: "all" },
  },
];

export function DrillDashboard({
  cards,
  attempts,
  fsrsStore,
  onOpenCard,
  onStartSession,
  initialPhase,
  initialClass,
}: DrillDashboardProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>(initialPhase ?? "all");
  const [classFilter, setClassFilter] = useState<ClassFilter>(initialClass ?? "all");
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("all");
  const [expandedTypes, setExpandedTypes] = useState<ReadonlySet<DrillTypeGroupId>>(
    () => new Set(["clearances"]),
  );
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const dueIds = useMemo(() => getDueDrillIds(fsrsStore), [fsrsStore]);
  const passedIds = useMemo(() => getPassedDrillIds(attempts), [attempts]);
  const passedCount = cards.filter((c) => passedIds.has(c.drillId)).length;
  const dueCount = cards.filter((c) => dueIds.has(c.drillId)).length;
  const newCount = cards.filter((c) => !(c.drillId in fsrsStore)).length;
  const dailyStreak = useMemo(() => getDailyAttemptStreak(attempts), [attempts]);

  const recentAttempts = useMemo(
    () => getRecentAttempts(attempts, 5),
    [attempts],
  );

  // Card lookup for the recent-attempts strip — handles drillIds that
  // reference deleted cards by dropping them gracefully.
  const cardById = useMemo(() => {
    const m = new Map<string, RadioDrillCard>();
    for (const c of cards) m.set(c.drillId, c);
    return m;
  }, [cards]);

  // Combined filter: phase + airspace class + FSRS schedule. Sorts due
  // cards first (oldest-due first) so the most overdue surface at the top
  // regardless of which drill-type group they're rendered under.
  const filtered = useMemo(() => {
    const list = cards.filter((c) => {
      if (phaseFilter !== "all" && c.phase !== phaseFilter) return false;
      if (classFilter !== "all" && c.airspaceClass !== classFilter) return false;
      if (scheduleFilter === "due" && !dueIds.has(c.drillId)) return false;
      if (scheduleFilter === "new" && c.drillId in fsrsStore) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      const aState = getScheduleState(fsrsStore, a.drillId);
      const bState = getScheduleState(fsrsStore, b.drillId);
      const order = { due: 0, new: 1, later: 2 } as const;
      if (order[aState] !== order[bState]) return order[aState] - order[bState];
      if (aState === "due" && bState === "due") {
        const aDue = new Date(fsrsStore[a.drillId]!.card.due).getTime();
        const bDue = new Date(fsrsStore[b.drillId]!.card.due).getTime();
        return aDue - bDue;
      }
      return 0;
    });
  }, [cards, phaseFilter, classFilter, scheduleFilter, dueIds, fsrsStore]);

  // Re-partition the filtered list into drill-type groups so the dashboard
  // can render collapsible sections per call type. Groups with no matching
  // cards are dropped so we don't render empty headers.
  const groupedByType = useMemo(() => {
    return DRILL_TYPE_GROUPS.map((group) => ({
      ...group,
      cards: filtered.filter((card) => getDrillTypeGroupId(card) === group.id),
    })).filter((group) => group.cards.length > 0);
  }, [filtered]);

  const cardsForPath = (path: CuratedPath) =>
    cards.filter((c) => {
      if (path.filter.phase !== "all" && c.phase !== path.filter.phase) return false;
      if (path.filter.airspaceClass !== "all" && c.airspaceClass !== path.filter.airspaceClass) return false;
      return true;
    });

  const applyPath = (path: CuratedPath) => {
    setPhaseFilter(path.filter.phase);
    setClassFilter(path.filter.airspaceClass);
    setScheduleFilter("all");
  };

  const toggleTypeGroup = (groupId: DrillTypeGroupId) => {
    setExpandedTypes((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const clearAllFilters = () => {
    setPhaseFilter("all");
    setClassFilter("all");
    setScheduleFilter("all");
  };

  const advancedFiltersActive =
    phaseFilter !== "all" || classFilter !== "all";

  // Hero CTA queue selection — due first, then new, capped at SESSION_SIZE.
  // Falls back to a refresh of already-passed cards when the learner has
  // burned through everything.
  const sessionQueue = useMemo<{
    cards: RadioDrillCard[];
    mode: "review" | "practice" | "refresh";
  }>(() => {
    if (dueCount > 0) {
      const due = filtered.filter((c) => dueIds.has(c.drillId));
      const fromFiltered = due.length > 0 ? due : cards.filter((c) => dueIds.has(c.drillId));
      return {
        cards: fromFiltered.slice(0, SESSION_SIZE),
        mode: "review",
      };
    }
    const newCards = cards.filter((c) => !(c.drillId in fsrsStore));
    if (newCards.length > 0) {
      return {
        cards: shuffleStable(newCards).slice(0, SESSION_SIZE),
        mode: "practice",
      };
    }
    return {
      cards: shuffleStable([...cards]).slice(0, SESSION_SIZE),
      mode: "refresh",
    };
  }, [filtered, cards, fsrsStore, dueIds, dueCount]);

  return (
    <div className="space-y-5">
      {/* Stats row — replaces the buried "0 of 1314 passed" line. Numbers
          up front so a returning learner sees their state immediately. */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Passed"
          value={`${passedCount}`}
          sub={`of ${cards.length}`}
        />
        <StatCard
          label="Due now"
          value={`${dueCount}`}
          tone={dueCount > 0 ? "warning" : "muted"}
        />
        <StatCard
          label="Streak"
          value={dailyStreak > 0 ? `${dailyStreak}d` : "—"}
          tone={dailyStreak >= 3 ? "success" : dailyStreak >= 7 ? "warning" : "default"}
          icon={dailyStreak >= 3 ? <Flame size={14} aria-hidden="true" /> : null}
        />
      </div>

      {/* Hero session CTA — one tap into the next batch. Beats four filter
          rows when the learner just wants to drill what's overdue. */}
      <button
        type="button"
        onClick={() => onStartSession(sessionQueue.cards)}
        disabled={sessionQueue.cards.length === 0}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-2xl border p-5 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          sessionQueue.cards.length === 0
            ? "cursor-not-allowed border-[var(--ifr-border)] bg-[var(--ifr-surface)] opacity-60"
            : "border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/10 hover:border-[var(--ifr-accent)]/70 hover:bg-[var(--ifr-accent)]/15",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ifr-accent)]">
            {sessionQueue.mode === "review" && "Review session"}
            {sessionQueue.mode === "practice" && "Practice session"}
            {sessionQueue.mode === "refresh" && "Refresh session"}
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--ifr-text)]">
            {sessionQueue.mode === "review" &&
              `${sessionQueue.cards.length} due card${sessionQueue.cards.length === 1 ? "" : "s"} ready`}
            {sessionQueue.mode === "practice" &&
              `Start ${sessionQueue.cards.length} new card${sessionQueue.cards.length === 1 ? "" : "s"}`}
            {sessionQueue.mode === "refresh" &&
              `Refresh — ${sessionQueue.cards.length} random card${sessionQueue.cards.length === 1 ? "" : "s"}`}
          </p>
          <p className="mt-1 text-xs text-[var(--ifr-text-muted)]">
            {sessionQueue.mode === "review" &&
              "Spaced-repetition picks the most overdue first."}
            {sessionQueue.mode === "practice" &&
              "Nothing due — start working through the unseen library."}
            {sessionQueue.mode === "refresh" &&
              "All caught up. Keep skills warm with a quick refresh."}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ifr-accent)] text-white">
          {sessionQueue.mode === "refresh" ? (
            <RefreshCw size={18} aria-hidden="true" />
          ) : (
            <Play size={18} aria-hidden="true" />
          )}
        </span>
      </button>

      {/* Curated starting paths — opinionated entry points so a returning
          learner doesn't have to dial in filter chips by hand. */}
      <section aria-label="Curated drill paths">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
          Start here
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CURATED_PATHS.map((path) => {
            const pathCards = cardsForPath(path);
            if (pathCards.length === 0) return null;
            const pathPassed = pathCards.filter((c) => passedIds.has(c.drillId)).length;
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => applyPath(path)}
                className={cn(
                  "rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-3 text-left transition-colors",
                  "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-accent)]/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                )}
              >
                <p className="text-sm font-semibold text-[var(--ifr-text)]">
                  {path.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--ifr-text-muted)]">
                  {path.description}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
                  {pathPassed}/{pathCards.length} passed
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Visible filter row — schedule chips (most-used) + a single
          "More filters" trigger that opens a bottom sheet with the airspace
          and phase chips. Saves the wall-of-chips on mobile. */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
            Schedule
          </p>
          <Sheet open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                  advancedFiltersActive
                    ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                    : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]",
                )}
              >
                <SlidersHorizontal size={12} aria-hidden="true" />
                More filters
                {advancedFiltersActive && (
                  <span className="rounded-full bg-[var(--ifr-accent)]/20 px-1.5 text-[10px] font-semibold">
                    {[phaseFilter !== "all" ? 1 : 0, classFilter !== "all" ? 1 : 0].reduce(
                      (a, b) => a + b,
                      0,
                    )}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>More filters</SheetTitle>
                <SheetDescription>
                  Narrow the library by airspace class or flight phase.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                <FilterRow
                  label="Airspace"
                  ariaLabel="Filter drills by airspace class"
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
                </FilterRow>
                <FilterRow
                  label="Flight phase"
                  ariaLabel="Filter drills by flight phase"
                >
                  <FilterChip
                    label="All"
                    active={phaseFilter === "all"}
                    count={cards.length}
                    onClick={() => setPhaseFilter("all")}
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
                        onClick={() => setPhaseFilter(phase.id)}
                      />
                    );
                  })}
                </FilterRow>
                {advancedFiltersActive && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-[var(--ifr-accent)] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter drills by review schedule"
        >
          <FilterChip
            label="All"
            active={scheduleFilter === "all"}
            count={cards.length}
            onClick={() => setScheduleFilter("all")}
          />
          {dueCount > 0 && (
            <FilterChip
              label="Due"
              title="Cards due for spaced-repetition review"
              active={scheduleFilter === "due"}
              count={dueCount}
              onClick={() => setScheduleFilter("due")}
            />
          )}
          <FilterChip
            label="New"
            title="Cards you haven't attempted yet"
            active={scheduleFilter === "new"}
            count={newCount}
            onClick={() => setScheduleFilter("new")}
          />
        </div>
      </div>

      {/* Card list grouped by call type */}
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

      {/* Recent attempts strip — last 5 cards the learner touched. Same
          spirit as the quiz dashboard's recent-sessions row. */}
      {recentAttempts.length > 0 && (
        <section aria-label="Recent attempts">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
            Recent attempts
          </p>
          <ul className="space-y-1.5">
            {recentAttempts.map((attempt) => {
              const card = cardById.get(attempt.drillId);
              if (!card) return null;
              return (
                <li key={`${attempt.attemptedAt}-${attempt.drillId}`}>
                  <button
                    type="button"
                    onClick={() => onOpenCard(attempt.drillId)}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-3 py-2 text-left transition-colors",
                      "hover:border-[var(--ifr-accent)]/40 hover:bg-[var(--ifr-accent)]/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                        attempt.isCorrect
                          ? "bg-[var(--ifr-success)]/15 text-[var(--ifr-success)]"
                          : "bg-[var(--ifr-danger)]/15 text-[var(--ifr-danger)]",
                      )}
                      aria-hidden="true"
                    >
                      {attempt.isCorrect ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]">
                      {card.title}
                    </span>
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-[var(--ifr-text-muted)]"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "muted" | "success" | "warning";
  icon?: React.ReactNode;
}

function StatCard({ label, value, sub, tone = "default", icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-3 text-center">
      <div
        className={cn(
          "flex items-center justify-center gap-1 text-xl font-bold",
          tone === "default" && "text-[var(--ifr-text)]",
          tone === "muted" && "text-[var(--ifr-text-muted)]",
          tone === "success" && "text-[var(--ifr-success)]",
          tone === "warning" && "text-[var(--ifr-warning)]",
        )}
      >
        {icon}
        <span>{value}</span>
        {sub && (
          <span className="text-xs font-normal text-[var(--ifr-text-muted)]">
            {sub}
          </span>
        )}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--ifr-text-muted)]">
        {label}
      </div>
    </div>
  );
}

interface FilterRowProps {
  label: string;
  ariaLabel: string;
  children: React.ReactNode;
}

function FilterRow({ label, ariaLabel, children }: FilterRowProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={ariaLabel}>
        {children}
      </div>
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

/**
 * Deterministic shuffle so successive renders of the same source list don't
 * jitter the queue. Uses the card-id string hash as the sort key — same
 * input array → same shuffled output. The hero CTA re-runs whenever the
 * inputs change, which naturally re-shuffles when the user attempts a card.
 */
function shuffleStable<T extends { drillId: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => hashString(a.drillId) - hashString(b.drillId));
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

interface FilterChipProps {
  label: string;
  title?: string;
  active: boolean;
  count: number;
  onClick: () => void;
}

function FilterChip({ label, title, active, count, onClick }: FilterChipProps) {
  const chip = (
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

  if (!title) return chip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}
