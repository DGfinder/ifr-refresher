"use client";

import { Radio, Volume2, Square } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioLeg } from "@/content/model/radio";
import { useRadioAudio } from "@/features/radio-calls/hooks/useRadioAudio";

interface TransmissionFeedProps {
  legs: RadioLeg[];
  visibleUpToIndex: number;
  className?: string;
}

const STATION_LABEL: Record<NonNullable<RadioLeg["transmission"]["station"]>, string> = {
  ground: "Ground",
  tower: "Tower",
  delivery: "Delivery",
  approach: "Approach",
  departure: "Departure",
  centre: "Centre",
  info: "Info",
  unicom: "Unicom",
};

export function TransmissionFeed({ legs, visibleUpToIndex, className }: TransmissionFeedProps) {
  const visible = legs.slice(0, visibleUpToIndex + 1);
  const audio = useRadioAudio();

  return (
    <div
      className={cn("space-y-3", className)}
      aria-label="Radio transmission transcript"
    >
      {visible.map((leg) => {
        const isPilot = leg.transmission.speaker === "pilot";
        const stationLabel = leg.transmission.station
          ? STATION_LABEL[leg.transmission.station]
          : null;
        const isThisSpeaking = audio.speakingId === leg.id;
        // ATC voice slightly lower-pitched + slightly slower for clarity.
        const speakOpts = isPilot
          ? { pitch: 1.05, rate: 1.0 }
          : { pitch: 0.9, rate: 0.95 };

        return (
          <div
            key={leg.id}
            className={cn(
              "flex flex-col gap-1 rounded-xl border p-3 text-sm leading-relaxed transition-colors",
              isPilot
                ? "border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 text-[var(--ifr-text)]"
                : "border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-text)]",
              isThisSpeaking && "ring-2 ring-[var(--ifr-focus-ring)]/40",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
                <Radio size={12} aria-hidden="true" />
                <span>{isPilot ? "Pilot" : "ATC"}</span>
                {stationLabel && (
                  <span className="text-[var(--ifr-text-muted)]/70">· {stationLabel}</span>
                )}
              </div>
              {audio.isSupported && (
                <button
                  type="button"
                  onClick={() =>
                    isThisSpeaking
                      ? audio.stop()
                      : audio.speak(leg.id, leg.transmission.text, speakOpts)
                  }
                  aria-label={
                    isThisSpeaking
                      ? `Stop playing ${isPilot ? "pilot" : "ATC"} transmission`
                      : `Play ${isPilot ? "pilot" : "ATC"} transmission aloud`
                  }
                  aria-pressed={isThisSpeaking}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--ifr-text-muted)] transition-colors hover:bg-[var(--ifr-surface-muted)] hover:text-[var(--ifr-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]"
                >
                  {isThisSpeaking ? <Square size={14} /> : <Volume2 size={14} />}
                </button>
              )}
            </div>
            <p>{leg.transmission.text}</p>
          </div>
        );
      })}
    </div>
  );
}
