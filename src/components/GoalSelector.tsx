"use client";

import { drillPrograms } from "@/data/drillPrograms";
import { useProgram } from "@/contexts/ProgramContext";
import { cn } from "@/lib/utils";

export function GoalSelector() {
  const { programId, setProgramId } = useProgram();

  return (
    <div className="mb-6">
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
        {drillPrograms.map((program) => {
          const isSelected = program.id === programId;
          return (
            <button
              key={program.id}
              onClick={() => setProgramId(program.id)}
              className={cn(
                "flex min-w-[140px] flex-col rounded-lg border p-3 text-left transition-colors md:min-w-0",
                isSelected
                  ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10"
                  : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] hover:border-[var(--ifr-accent)]/50"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-[var(--ifr-accent)]" : "text-foreground"
                )}
              >
                {program.label}
              </span>
              <span className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {program.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
