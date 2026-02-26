"use client";

import { drillPrograms } from "@/data/drillPrograms";
import type { DrillProgramId } from "@/types/drill";
import { cn } from "@/lib/utils";

interface ProgramFilterProps {
  programId: DrillProgramId;
  onProgramChange: (id: DrillProgramId) => void;
}

export function ProgramFilter({ programId, onProgramChange }: ProgramFilterProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--ifr-text-muted)]">
        Filter by program
      </label>
      <div className="flex flex-wrap gap-2">
        {drillPrograms.map((program) => {
          const isSelected = program.id === programId;
          return (
            <button
              key={program.id}
              onClick={() => onProgramChange(program.id)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)] text-[var(--ifr-text-muted)] hover:border-[var(--ifr-accent)]/50"
              )}
            >
              {program.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--ifr-text-muted)]">
        {drillPrograms.find((p) => p.id === programId)?.description}
      </p>
    </div>
  );
}
