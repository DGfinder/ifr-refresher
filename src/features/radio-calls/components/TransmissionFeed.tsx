"use client";

import { Radio } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { RadioLeg } from "@/content/model/radio";

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
        return (
          <div
            key={leg.id}
            className={cn(
              "flex flex-col gap-1 rounded-xl border p-3 text-sm leading-relaxed",
              isPilot
                ? "border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 text-[var(--ifr-text)]"
                : "border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-text)]",
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ifr-text-muted)]">
              <Radio size={12} aria-hidden="true" />
              <span>{isPilot ? "Pilot" : "ATC"}</span>
              {stationLabel && (
                <span className="text-[var(--ifr-text-muted)]/70">· {stationLabel}</span>
              )}
            </div>
            <p>{leg.transmission.text}</p>
          </div>
        );
      })}
    </div>
  );
}
