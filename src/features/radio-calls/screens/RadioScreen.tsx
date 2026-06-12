"use client";

import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Section } from "@/content/model/section";
import { radioScenarios } from "@/content/registry/radioScenarios";
import {
  radioDrillCards,
  getRadioDrillCardById,
} from "@/content/registry/radioDrillCards";
import radioCallsSection from "@/content/data/radio-calls.json";
import type {
  AirspaceClass,
  RadioDrillCard,
  RadioPhase,
} from "@/content/model/radio";
import { useRadioSession } from "@/features/radio-calls/hooks/useRadioSession";
import { RadioDashboard } from "@/features/radio-calls/components/RadioDashboard";
import { TransmissionFeed } from "@/features/radio-calls/components/TransmissionFeed";
import { NextCallChoice } from "@/features/radio-calls/components/NextCallChoice";
import { ReadbackBuilder } from "@/features/radio-calls/components/ReadbackBuilder";
import { SpokenCallChallenge } from "@/features/radio-calls/components/SpokenCallChallenge";
import { RadioResults } from "@/features/radio-calls/components/RadioResults";
import { DrillDashboard } from "@/features/radio-calls/components/DrillDashboard";
import { DrillCardView } from "@/features/radio-calls/components/DrillCardView";
import { LearnTab } from "@/features/radio-calls/components/LearnTab";
import { useRadioDrillHistory } from "@/features/radio-calls/hooks/useRadioDrillHistory";
import { useRadioDrillFSRS } from "@/features/radio-calls/hooks/useRadioDrillFSRS";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";

type Tab = "learn" | "drill" | "scenarios";

const VALID_PHASES: ReadonlySet<RadioPhase> = new Set([
  "pre-departure",
  "departure",
  "enroute",
  "arrival",
  "final",
  "non-normal",
]);
const VALID_CLASSES: ReadonlySet<AirspaceClass> = new Set(["C", "D", "E", "CTAF"]);
const VALID_TABS: ReadonlySet<Tab> = new Set(["learn", "drill", "scenarios"]);

const RADIO_CALLS_SECTION = radioCallsSection as Section;

function RadioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initial-only: URL params seed initial state. Tab/filter changes after
  // mount are local UX and don't push history.
  // Default to Drill — most learners reach for one call at a time before
  // committing to a multi-leg flight. Theory and Scenarios reachable by tab.
  const tabParam = searchParams?.get("tab");
  const initialTab: Tab =
    tabParam && VALID_TABS.has(tabParam as Tab) ? (tabParam as Tab) : "drill";
  const phaseParam = searchParams?.get("phase");
  const classParam = searchParams?.get("class");
  const initialPhase: RadioPhase | null =
    phaseParam && VALID_PHASES.has(phaseParam as RadioPhase)
      ? (phaseParam as RadioPhase)
      : null;
  const initialClass: AirspaceClass | null =
    classParam && VALID_CLASSES.has(classParam as AirspaceClass)
      ? (classParam as AirspaceClass)
      : null;
  const initialModuleId = searchParams?.get("module") ?? null;
  const initialTag = searchParams?.get("tag") ?? "";

  const [tab, setTab] = useState<Tab>(initialTab);

  const handleTabChange = (next: Tab) => {
    setTab(next);
    // Reflect the active tab in the URL so refreshes land you back on the
    // same view. `replace` to avoid history-spam from idle tab flips.
    const params = new URLSearchParams();
    params.set("tab", next);
    router.replace(`/radio?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={tab} onValueChange={(v) => handleTabChange(v as Tab)} className="block">
      <div className="mx-auto max-w-2xl px-6 pt-6">
        <h1 className="mb-2 text-2xl font-bold text-[var(--ifr-text)] md:text-3xl">
          Radio Calls
        </h1>
        <p className="mb-4 text-sm text-[var(--ifr-text-muted)]">
          AIP phraseology — learn the phrase family, drill it cold, fly it in a
          scenario. Sourced from AIP GEN 3.4 / 3.6, AIP ENR 1.5, and MATS Part 4.
        </p>
        <TabsList className="mb-4 flex w-full">
          <TabsTrigger value="learn" className="flex-col items-start py-2">
            <span className="text-sm font-semibold">Learn</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              {RADIO_CALLS_SECTION.modules.length} modules
            </span>
          </TabsTrigger>
          <TabsTrigger value="drill" className="flex-col items-start py-2">
            <span className="text-sm font-semibold">Drill</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              One call at a time
            </span>
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex-col items-start py-2">
            <span className="text-sm font-semibold">Scenarios</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              Multi-leg flight
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="learn">
        <LearnTab
          section={RADIO_CALLS_SECTION}
          initialModuleId={tab === "learn" ? initialModuleId : null}
          initialTag={tab === "learn" ? initialTag : ""}
          onModuleChange={(moduleId) => {
            const params = new URLSearchParams();
            params.set("tab", "learn");
            if (moduleId) params.set("module", moduleId);
            router.replace(`/radio?${params.toString()}`, { scroll: false });
          }}
        />
      </TabsContent>
      <TabsContent value="scenarios">
        <ScenariosTab />
      </TabsContent>
      <TabsContent value="drill">
        <DrillTab initialPhase={initialPhase} initialClass={initialClass} />
      </TabsContent>
    </Tabs>
  );
}

// ─── Scenarios tab ────────────────────────────────────────────────────────

function ScenariosTab() {
  const session = useRadioSession({ scenarios: radioScenarios });

  const currentLeg = useMemo(() => {
    if (!session.currentScenario) return null;
    return session.currentScenario.legs[session.currentLegIndex] ?? null;
  }, [session.currentScenario, session.currentLegIndex]);

  if (session.phase === "dashboard") {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-6">
        <RadioDashboard
          scenarios={session.scenarios}
          history={session.history}
          onStart={session.startScenario}
        />
      </div>
    );
  }

  if (session.phase === "session" && session.currentScenario && currentLeg) {
    const progressPct =
      session.totalLegs > 0
        ? Math.round(((session.currentLegIndex + 1) / session.totalLegs) * 100)
        : 0;

    return (
      <div className="mx-auto max-w-2xl px-6 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={session.resetToDashboard}
            className="-ml-2 h-auto px-2 py-1 text-sm font-normal"
          >
            ← Back
          </Button>
          <span className="text-xs font-medium text-[var(--ifr-text-muted)]">
            Leg {session.currentLegIndex + 1} of {session.totalLegs}
          </span>
        </div>

        <Card className="mb-4 p-4 text-sm">
          <p className="font-semibold text-[var(--ifr-text)]">
            {session.currentScenario.title}
          </p>
          <p className="mt-1 text-[var(--ifr-text-muted)]">
            {session.currentScenario.briefing.callsign}
            {session.currentScenario.briefing.departure &&
              ` · ${session.currentScenario.briefing.departure}`}
            {session.currentScenario.briefing.destination &&
              ` → ${session.currentScenario.briefing.destination}`}
            {" · "}
            {session.currentScenario.briefing.flightRules}
          </p>
        </Card>

        <ProgressBar
          value={progressPct}
          className="mb-4 h-1.5 w-full bg-[var(--ifr-surface-muted)]"
          aria-label="Scenario progress"
        />

        <TransmissionFeed
          legs={session.currentScenario.legs}
          visibleUpToIndex={currentLeg.question && !session.isAnswered ? session.currentLegIndex - 1 : session.currentLegIndex}
          className="mb-4"
        />

        {currentLeg.question ? (
          <>
            {currentLeg.question.kind === "mcq" && (
              <NextCallChoice
                question={currentLeg.question}
                selectedOptionId={session.selectedOptionId}
                onSelect={session.selectOption}
              />
            )}
            {currentLeg.question.kind === "readback" && (
              <ReadbackBuilder
                readback={currentLeg.question}
                selectedChipIds={session.selectedChipIds}
                isSubmitted={session.isReadbackSubmitted}
                onToggleChip={session.toggleChip}
                onSubmit={session.submitReadback}
              />
            )}
            {currentLeg.question.kind === "spoken" && (
              <SpokenCallChallenge
                call={currentLeg.question}
                isSubmitted={session.isSpokenSubmitted}
                transcript={session.spokenTranscript}
                onTranscriptChange={session.setSpokenTranscript}
                onSubmit={session.submitSpokenCall}
                onRetry={session.retryCurrent}
              />
            )}
            {session.isAnswered && (
              <Button onClick={session.advance} size="lg" className="mt-4 w-full">
                {session.currentLegIndex + 1 >= session.totalLegs ? "See Results" : "Continue"}
              </Button>
            )}
          </>
        ) : (
          <Button onClick={session.advance} size="lg" className="w-full">
            {session.currentLegIndex + 1 >= session.totalLegs ? "See Results" : "Continue"}
          </Button>
        )}
      </div>
    );
  }

  if (session.phase === "results" && session.currentScenario && session.result) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-6">
        <RadioResults
          scenario={session.currentScenario}
          result={session.result}
          answers={session.answers}
          onPlayAgain={() => session.startScenario(session.currentScenario!.scenarioId)}
          onBackToDashboard={session.resetToDashboard}
        />
      </div>
    );
  }

  return null;
}

// ─── Drill tab ────────────────────────────────────────────────────────────

interface DrillTabProps {
  initialPhase: RadioPhase | null;
  initialClass: AirspaceClass | null;
}

function DrillTab({ initialPhase, initialClass }: DrillTabProps) {
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);
  // Hero-CTA queue: drill ids to walk in order. On completion the view
  // auto-advances to the next id without dropping back to the dashboard.
  // Empty list means "no active queue" — back / complete returns to dash.
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const { attempts, recordAttempt } = useRadioDrillHistory();
  const { store: fsrsStore, scheduleNext } = useRadioDrillFSRS();

  const currentCard = useMemo(
    () => (selectedDrillId ? getRadioDrillCardById(selectedDrillId) ?? null : null),
    [selectedDrillId],
  );

  const startSession = (sessionCards: RadioDrillCard[]) => {
    if (sessionCards.length === 0) return;
    const ids = sessionCards.map((c) => c.drillId);
    setQueueIds(ids);
    setSelectedDrillId(ids[0]!);
  };

  const handleBack = () => {
    setSelectedDrillId(null);
    setQueueIds([]);
  };

  const handleComplete = (drillId: string, isCorrect: boolean) => {
    // Fire-and-forget — the UI advances regardless of the persist
    // round-trip. Failures are logged in the store.
    void recordAttempt(drillId, isCorrect);
    void scheduleNext(drillId, isCorrect);

    const currentIdx = queueIds.indexOf(drillId);
    const nextId =
      currentIdx >= 0 && currentIdx < queueIds.length - 1
        ? queueIds[currentIdx + 1] ?? null
        : null;
    if (nextId) {
      setSelectedDrillId(nextId);
    } else {
      setSelectedDrillId(null);
      setQueueIds([]);
    }
  };

  if (currentCard) {
    const queuePos = queueIds.indexOf(currentCard.drillId);
    const queueLen = queueIds.length;
    return (
      <div className="mx-auto max-w-2xl px-6 pb-6">
        {queueLen > 0 && (
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--ifr-text-muted)]">
            Card {queuePos + 1} of {queueLen}
          </p>
        )}
        <DrillCardView
          // Remount on card change so per-card state stays fresh without an
          // explicit reset effect.
          key={currentCard.drillId}
          card={currentCard}
          onBack={handleBack}
          onComplete={(record) => handleComplete(currentCard.drillId, record.isCorrect)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-6">
      <DrillDashboard
        cards={radioDrillCards}
        attempts={attempts}
        fsrsStore={fsrsStore}
        onOpenCard={setSelectedDrillId}
        onStartSession={startSession}
        initialPhase={initialPhase}
        initialClass={initialClass}
      />
    </div>
  );
}

export function RadioScreen() {
  return (
    <Suspense fallback={null}>
      <RadioPageContent />
    </Suspense>
  );
}
