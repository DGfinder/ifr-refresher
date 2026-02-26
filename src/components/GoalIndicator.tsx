"use client";

import Link from "next/link";
import { useProgram } from "@/contexts/ProgramContext";
import { drillPrograms } from "@/data/drillPrograms";

export function GoalIndicator() {
  const { programId } = useProgram();
  const program = drillPrograms.find((p) => p.id === programId);

  if (!program) return null;

  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-[var(--ifr-text-muted)]">
      <span>
        Goal: <strong className="text-[var(--ifr-text)]">{program.label}</strong>
      </span>
      <Link
        href="/"
        className="text-[var(--ifr-accent)] hover:underline underline-offset-2"
      >
        Change
      </Link>
    </div>
  );
}
