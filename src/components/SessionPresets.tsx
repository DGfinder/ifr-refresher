"use client";

import { cn } from "@/lib/utils";

export type PresetId = "smart" | "weak" | "new" | "quick10";

interface Preset {
  id: PresetId;
  label: string;
}

const presets: Preset[] = [
  { id: "smart", label: "Smart mix" },
  { id: "weak", label: "Weak focus" },
  { id: "new", label: "New only" },
  { id: "quick10", label: "Quick 10" },
];

interface SessionPresetsProps {
  activePreset: PresetId;
  onSelectPreset: (preset: PresetId) => void;
}

export function SessionPresets({ activePreset, onSelectPreset }: SessionPresetsProps) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:justify-center md:overflow-visible md:pb-0">
      {presets.map((preset) => {
        const isActive = preset.id === activePreset;
        return (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:border-[var(--ifr-accent)]/50 hover:text-[var(--ifr-text)]"
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
