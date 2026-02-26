"use client";

import { drillPrograms } from "@/data/drillPrograms";
import type { DrillProgramId } from "@/types/drill";
import { cn } from "@/lib/utils";

interface ProgramTabsProps {
  programId: DrillProgramId;
  onProgramChange: (id: DrillProgramId) => void;
}

export function ProgramTabs({ programId, onProgramChange }: ProgramTabsProps) {
  const currentProgram = drillPrograms.find((p) => p.id === programId);

  return (
    <div className="mb-6">
      {/* Horizontal tabs - scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-1">
        {drillPrograms.map((program) => {
          const isSelected = program.id === programId;
          return (
            <button
              key={program.id}
              onClick={() => onProgramChange(program.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
                "flex-shrink-0",
                isSelected
                  ? "bg-[var(--ifr-accent)] text-white shadow-sm"
                  : "text-[var(--ifr-text-muted)] hover:bg-[var(--ifr-surface-muted)] hover:text-[var(--ifr-text)]"
              )}
            >
              {program.label}
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
