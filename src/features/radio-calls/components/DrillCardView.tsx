"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { BookOpen, Radio } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioDrillCard, RadioOptionId } from "@/content/model/radio";
import {
  buildRadioAnswer,
  buildRadioReadbackAnswer,
  buildRadioSpokenAnswer,
} from "@/features/radio-calls/model/buildRadioSession";
import { getGuideUrlForDrill } from "@/features/radio-calls/model/guideMapping";
import { NextCallChoice } from "@/features/radio-calls/components/NextCallChoice";
import { ReadbackBuilder } from "@/features/radio-calls/components/ReadbackBuilder";
import { SpokenCallChallenge } from "@/features/radio-calls/components/SpokenCallChallenge";
import type { RadioAnswerRecord } from "@/features/radio-calls/model/types";

interface DrillCardViewProps {
  card: RadioDrillCard;
  onBack: () => void;
  onComplete: (record: RadioAnswerRecord) => void;
}

const STATION_LABEL: Record<string, string> = {
  ground: "Ground",
  tower: "Tower",
  delivery: "Delivery",
  approach: "Approach",
  departure: "Departure",
  centre: "Centre",
  info: "Info",
  unicom: "Unicom",
};

export function DrillCardView({ card, onBack, onComplete }: DrillCardViewProps) {
  const challenge = card.challenge;

  // MCQ state
  const [selectedOptionId, setSelectedOptionId] = useState<RadioOptionId | null>(null);
  // Readback state
  const [selectedChipIds, setSelectedChipIds] = useState<ReadonlySet<string>>(new Set());
  const [isReadbackSubmitted, setIsReadbackSubmitted] = useState(false);
  // Spoken state
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [isSpokenSubmitted, setIsSpokenSubmitted] = useState(false);

  // Submitted answer, if any. State stays fresh per-card because RadioScreen
  // remounts this component via `key={card.drillId}` — no reset effect.
  const [record, setRecord] = useState<RadioAnswerRecord | null>(null);

  const handleMcqSelect = useCallback(
    (optionId: RadioOptionId) => {
      if (challenge.kind !== "mcq" || selectedOptionId !== null) return;
      const r = buildRadioAnswer(challenge, optionId);
      setSelectedOptionId(optionId);
      setRecord(r);
    },
    [challenge, selectedOptionId],
  );

  const handleChipToggle = useCallback(
    (chipId: string) => {
      if (challenge.kind !== "readback" || isReadbackSubmitted) return;
      setSelectedChipIds((prev) => {
        const next = new Set(prev);
        if (next.has(chipId)) next.delete(chipId);
        else next.add(chipId);
        return next;
      });
    },
    [challenge, isReadbackSubmitted],
  );

  const handleReadbackSubmit = useCallback(() => {
    if (challenge.kind !== "readback" || isReadbackSubmitted) return;
    const r = buildRadioReadbackAnswer(challenge, [...selectedChipIds]);
    setIsReadbackSubmitted(true);
    setRecord(r);
  }, [challenge, isReadbackSubmitted, selectedChipIds]);

  const handleSpokenSubmit = useCallback((transcript: string) => {
    if (challenge.kind !== "spoken" || isSpokenSubmitted) return;
    const r = buildRadioSpokenAnswer(challenge, transcript);
    setSpokenTranscript(transcript);
    setIsSpokenSubmitted(true);
    setRecord(r);
  }, [challenge, isSpokenSubmitted]);

  const handleRetry = useCallback(() => {
    setSelectedOptionId(null);
    setSelectedChipIds(new Set());
    setIsReadbackSubmitted(false);
    setSpokenTranscript("");
    setIsSpokenSubmitted(false);
    setRecord(null);
  }, []);

  const handleDone = () => {
    if (record) onComplete(record);
  };

  const isAnswered = record !== null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--ifr-text-muted)] transition-colors hover:text-[var(--ifr-text)]"
        >
          ← Back to drills
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--ifr-text-muted)]">
          {card.phase.replace("-", " ")}
        </span>
      </div>

      {/* Read AIP background — deep-link to the matching study module */}
      <Link
        href={getGuideUrlForDrill(card)}
        className={cn(
          "mb-4 flex items-center justify-between gap-2 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] px-3 py-2 text-xs text-[var(--ifr-text-muted)] transition-colors",
          "hover:border-[var(--ifr-accent)]/40 hover:text-[var(--ifr-text)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
        )}
      >
        <span className="flex items-center gap-2">
          <BookOpen size={12} aria-hidden="true" />
          Read the AIP background
        </span>
        <span aria-hidden="true">→</span>
      </Link>

      {/* Briefing card */}
      <div className="mb-4 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
        <h2 className="mb-2 text-lg font-semibold text-[var(--ifr-text)]">
          {card.title}
        </h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-[var(--ifr-text-muted)]">Aircraft</dt>
          <dd className="text-[var(--ifr-text)]">
            {card.briefing.callsign}
            {card.briefing.aircraftType && ` · ${card.briefing.aircraftType}`}
          </dd>
          {(card.briefing.departure || card.briefing.destination) && (
            <>
              <dt className="text-[var(--ifr-text-muted)]">Route</dt>
              <dd className="text-[var(--ifr-text)]">
                {card.briefing.departure ?? "—"}
                {card.briefing.destination && ` → ${card.briefing.destination}`}
              </dd>
            </>
          )}
          <dt className="text-[var(--ifr-text-muted)]">Rules</dt>
          <dd className="text-[var(--ifr-text)]">{card.briefing.flightRules}</dd>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ifr-text-muted)]">
          {card.briefing.summary}
        </p>
      </div>

      {/* Last ATC transmission, if any */}
      {card.briefing.lastTransmission && (
        <div className="mb-4 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] p-3 text-sm">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
            <Radio size={12} aria-hidden="true" />
            <span>ATC</span>
            {card.briefing.lastTransmission.station && (
              <span>· {STATION_LABEL[card.briefing.lastTransmission.station] ?? card.briefing.lastTransmission.station}</span>
            )}
          </div>
          <p className="text-[var(--ifr-text)]">{card.briefing.lastTransmission.text}</p>
        </div>
      )}

      {/* Challenge */}
      {challenge.kind === "mcq" && (
        <NextCallChoice
          question={challenge}
          selectedOptionId={selectedOptionId}
          onSelect={handleMcqSelect}
        />
      )}
      {challenge.kind === "readback" && (
        <ReadbackBuilder
          readback={challenge}
          selectedChipIds={selectedChipIds}
          isSubmitted={isReadbackSubmitted}
          onToggleChip={handleChipToggle}
          onSubmit={handleReadbackSubmit}
        />
      )}
      {challenge.kind === "spoken" && (
        <SpokenCallChallenge
          call={challenge}
          isSubmitted={isSpokenSubmitted}
          transcript={spokenTranscript}
          onTranscriptChange={setSpokenTranscript}
          onSubmit={handleSpokenSubmit}
          onRetry={handleRetry}
        />
      )}

      {isAnswered && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              "rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] py-3 text-sm font-medium text-[var(--ifr-text)] transition-colors hover:bg-[var(--ifr-surface-muted)]",
            )}
          >
            Back to drills
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="rounded-xl bg-[var(--ifr-cta-bg)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--ifr-cta-bg-hover)]"
          >
            Mark done
          </button>
        </div>
      )}

      <p className="mt-4 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] px-3 py-2 text-xs leading-relaxed text-[var(--ifr-text-muted)]">
        <span className="font-semibold uppercase tracking-wider">Reminder · </span>
        Study aid only. Verify against current CASA, AIP, ERSA, and operator
        procedures before flight.
      </p>
    </div>
  );
}
