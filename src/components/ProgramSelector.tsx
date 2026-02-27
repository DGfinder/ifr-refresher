"use client";

import type { ProgramId } from "@/types/programs";
import { STUDY_PROGRAMS } from "@/data/programs";
import { cn } from "@/lib/utils";

interface ProgramSelectorProps {
  value: ProgramId;
  onChange: (programId: ProgramId) => void;
}

const SHORT_NAMES: Record<ProgramId, string> = {
  ipc_oral: "IPC Oral",
  airline_panel: "Airline",
  quick_fire_numbers: "Quick Fire",
  god_mode: "God Mode",
};

export function ProgramSelector({ value, onChange }: ProgramSelectorProps) {
  const currentProgram = STUDY_PROGRAMS.find((p) => p.id === value);

  return (
    <div className="mb-6">
      {/* Horizontal scrollable pills */}
      <div className="flex gap-2 overflow-x-auto py-1">
        {STUDY_PROGRAMS.map((program) => {
          const isSelected = program.id === value;
          return (
            <button
              key={program.id}
              onClick={() => onChange(program.id)}
              className={cn(
                "min-h-[36px] whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                "flex-shrink-0 border",
                isSelected
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
              )}
            >
              {SHORT_NAMES[program.id]}
            </button>
          );
        })}
      </div>

      {/* Program description */}
      <p className="mt-2 text-sm text-[var(--ifr-text-muted)]">
        {currentProgram?.description}
      </p>
    </div>
  );
}
