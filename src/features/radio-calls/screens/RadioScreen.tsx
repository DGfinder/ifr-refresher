"use client";

import { useMemo, useState } from "react";
import { radioScenarios } from "@/content/registry/radioScenarios";
import { radioDrillCards, getRadioDrillCardById } from "@/content/registry/radioDrillCards";
import { useRadioSession } from "@/features/radio-calls/hooks/useRadioSession";
import { RadioDashboard } from "@/features/radio-calls/components/RadioDashboard";
import { TransmissionFeed } from "@/features/radio-calls/components/TransmissionFeed";
import { NextCallChoice } from "@/features/radio-calls/components/NextCallChoice";
import { ReadbackBuilder } from "@/features/radio-calls/components/ReadbackBuilder";
import { SpokenCallChallenge } from "@/features/radio-calls/components/SpokenCallChallenge";
import { RadioResults } from "@/features/radio-calls/components/RadioResults";
import { DrillDashboard } from "@/features/radio-calls/components/DrillDashboard";
import { DrillCardView } from "@/features/radio-calls/components/DrillCardView";
import { useRadioDrillHistory } from "@/features/radio-calls/hooks/useRadioDrillHistory";
import { cn } from "@/shared/lib/cn";

type Tab = "scenarios" | "drill";

export function RadioScreen() {
  const [tab, setTab] = useState<Tab>("scenarios");

  return (
    <div>
      <RadioHeader tab={tab} onTabChange={setTab} />
      {tab === "scenarios" ? <ScenariosTab /> : <DrillTab />}
    </div>
  );
}

interface RadioHeaderProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

function RadioHeader({ tab, onTabChange }: RadioHeaderProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-6">
      <h1 className="mb-2 text-2xl font-bold text-[var(--ifr-text)] md:text-3xl">
        Radio Calls
      </h1>
      <p className="mb-4 text-sm text-[var(--ifr-text-muted)]">
        AIP phraseology practice. Speak the call, type it, or pick it — drawn
        from AIP GEN 3.4 / 3.6, AIP ENR 1.5, and MATS Part 4.
      </p>
      <div className="mb-4 flex gap-1 rounded-xl bg-[var(--ifr-surface-muted)] p-1" role="tablist">
        <TabButton
          label="Scenarios"
          sublabel="Walk a flight"
          active={tab === "scenarios"}
          onClick={() => onTabChange("scenarios")}
        />
        <TabButton
          label="Drill"
          sublabel="One call at a time"
          active={tab === "drill"}
          onClick={() => onTabChange("drill")}
        />
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, sublabel, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-start rounded-lg px-3 py-2 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
        active
          ? "bg-[var(--ifr-surface)] text-[var(--ifr-text)] shadow-sm"
          : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]",
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">{sublabel}</span>
    </button>
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
          <button
            type="button"
            onClick={session.resetToDashboard}
            className="text-sm text-[var(--ifr-text-muted)] transition-colors hover:text-[var(--ifr-text)]"
          >
            ← Back
          </button>
          <span className="text-xs font-medium text-[var(--ifr-text-muted)]">
            Leg {session.currentLegIndex + 1} of {session.totalLegs}
          </span>
        </div>

        <div className="mb-4 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-sm">
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
        </div>

        <div
          className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ifr-surface-muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label="Scenario progress"
        >
          <div
            className="h-full bg-[var(--ifr-accent)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

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
              />
            )}
            {session.isAnswered && (
              <button
                type="button"
                onClick={session.advance}
                className="mt-4 w-full rounded-xl bg-[var(--ifr-cta-bg)] py-3 font-medium text-white transition-colors hover:bg-[var(--ifr-cta-bg-hover)]"
              >
                {session.currentLegIndex + 1 >= session.totalLegs ? "See Results" : "Continue"}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={session.advance}
            className="w-full rounded-xl bg-[var(--ifr-cta-bg)] py-3 font-medium text-white transition-colors hover:bg-[var(--ifr-cta-bg-hover)]"
          >
            {session.currentLegIndex + 1 >= session.totalLegs ? "See Results" : "Continue"}
          </button>
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
          onPlayAgain={() => session.startScenario(session.currentScenario!.scenarioId)}
          onBackToDashboard={session.resetToDashboard}
        />
      </div>
    );
  }

  return null;
}

// ─── Drill tab ────────────────────────────────────────────────────────────

function DrillTab() {
  const [selectedDrillId, setSelectedDrillId] = useState<string | null>(null);
  const { attempts, recordAttempt } = useRadioDrillHistory();

  const currentCard = useMemo(
    () => (selectedDrillId ? getRadioDrillCardById(selectedDrillId) ?? null : null),
    [selectedDrillId],
  );

  if (currentCard) {
    return (
      <DrillCardView
        // Remount on card change so per-card state stays fresh without an
        // explicit reset effect.
        key={currentCard.drillId}
        card={currentCard}
        onBack={() => setSelectedDrillId(null)}
        onComplete={(record) => {
          // Fire-and-forget — the UI navigates back regardless of the
          // persist round-trip. Failures are logged in the store.
          void recordAttempt(currentCard.drillId, record.isCorrect);
          setSelectedDrillId(null);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-6">
      <DrillDashboard
        cards={radioDrillCards}
        attempts={attempts}
        onOpenCard={setSelectedDrillId}
      />
    </div>
  );
}
