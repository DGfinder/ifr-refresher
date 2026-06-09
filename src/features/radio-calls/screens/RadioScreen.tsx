"use client";

import { useMemo } from "react";
import { radioScenarios } from "@/content/registry/radioScenarios";
import { useRadioSession } from "@/features/radio-calls/hooks/useRadioSession";
import { RadioDashboard } from "@/features/radio-calls/components/RadioDashboard";
import { TransmissionFeed } from "@/features/radio-calls/components/TransmissionFeed";
import { NextCallChoice } from "@/features/radio-calls/components/NextCallChoice";
import { RadioResults } from "@/features/radio-calls/components/RadioResults";

export function RadioScreen() {
  const session = useRadioSession({ scenarios: radioScenarios });

  const currentLeg = useMemo(() => {
    if (!session.currentScenario) return null;
    return session.currentScenario.legs[session.currentLegIndex] ?? null;
  }, [session.currentScenario, session.currentLegIndex]);

  // Dashboard
  if (session.phase === "dashboard") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        <h1 className="mb-2 text-2xl font-bold text-[var(--ifr-text)] md:text-3xl">
          Radio Calls
        </h1>
        <p className="mb-6 text-sm text-[var(--ifr-text-muted)]">
          Scenario-driven phraseology practice. Drawn from AIP GEN 3.4 and MATS Part 4.
        </p>
        <RadioDashboard
          scenarios={session.scenarios}
          history={session.history}
          onStart={session.startScenario}
        />
      </div>
    );
  }

  // Session
  if (session.phase === "session" && session.currentScenario && currentLeg) {
    const progressPct =
      session.totalLegs > 0
        ? Math.round(((session.currentLegIndex + 1) / session.totalLegs) * 100)
        : 0;

    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        {/* Top bar */}
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

        {/* Briefing */}
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

        {/* Progress bar */}
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

        {/* Transcript so far. For the active leg, show its question (not yet the
            transmission) when the learner still has to pick. After the answer,
            include the transmission in the feed. */}
        <TransmissionFeed
          legs={session.currentScenario.legs}
          visibleUpToIndex={currentLeg.question && !session.isAnswered ? session.currentLegIndex - 1 : session.currentLegIndex}
          className="mb-4"
        />

        {/* Current question (if any) or continue button */}
        {currentLeg.question ? (
          <>
            <NextCallChoice
              question={currentLeg.question}
              selectedOptionId={session.selectedOptionId}
              onSelect={session.selectOption}
            />
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

  // Results
  if (session.phase === "results" && session.currentScenario && session.result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
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
