"use client";

import { Radio } from "lucide-react";
import type { RadioScenario } from "@/content/model/radio";
import {
  getBestForScenario,
  type RadioHistoryEntry,
} from "@/features/radio-calls/storage/radioHistoryStore";
import { Card } from "@/shared/ui/card";

interface RadioDashboardProps {
  scenarios: RadioScenario[];
  history: RadioHistoryEntry[];
  onStart: (scenarioId: string) => void;
}

export function RadioDashboard({ scenarios, history, onStart }: RadioDashboardProps) {
  if (scenarios.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-[var(--ifr-text-muted)]">
          No radio scenarios available yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 p-5 shadow-none">
        <div className="mb-2 flex items-center gap-2">
          <Radio size={16} className="text-[var(--ifr-accent)]" aria-hidden="true" />
          <p className="text-sm font-semibold text-[var(--ifr-text)]">
            Practice radio phraseology
          </p>
        </div>
        <p className="text-sm leading-relaxed text-[var(--ifr-text-muted)]">
          Walk through a scenario one transmission at a time. When it&apos;s your turn,
          pick the correct call from four options. Everything is sourced from AIP
          Australia and MATS.
        </p>
      </Card>

      <ul className="space-y-3" aria-label="Available radio scenarios">
        {scenarios.map((scenario) => {
          const questionCount = scenario.legs.filter((l) => l.question !== undefined).length;
          const best = getBestForScenario(history, scenario.scenarioId);
          return (
            <li key={scenario.scenarioId}>
              <button
                type="button"
                onClick={() => onStart(scenario.scenarioId)}
                className="group flex w-full flex-col gap-2 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-left transition-all hover:border-[var(--ifr-accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-[var(--ifr-text)] group-hover:text-[var(--ifr-accent)]">
                    {scenario.title}
                  </h3>
                  <span className="flex items-center gap-2 text-xs font-medium text-[var(--ifr-text-muted)]">
                    {best && (
                      <span
                        className="rounded-full bg-[var(--ifr-success)]/10 px-2 py-0.5 font-semibold text-[var(--ifr-success)]"
                        aria-label={`Best score ${best.percentage} percent`}
                      >
                        Best {best.percentage}%
                      </span>
                    )}
                    <span>
                      {scenario.briefing.flightRules} · {questionCount} call{questionCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--ifr-text-muted)]">
                  {scenario.briefing.summary}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--ifr-text-muted)]">
                  <span className="rounded-md bg-[var(--ifr-surface-muted)] px-2 py-0.5">
                    {scenario.briefing.callsign}
                  </span>
                  {scenario.briefing.departure && (
                    <span className="rounded-md bg-[var(--ifr-surface-muted)] px-2 py-0.5">
                      {scenario.briefing.departure}
                      {scenario.briefing.destination && ` → ${scenario.briefing.destination}`}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
