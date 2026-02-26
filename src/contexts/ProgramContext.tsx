"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { DrillProgramId } from "@/types/drill";

interface ProgramContextValue {
  programId: DrillProgramId;
  setProgramId: (id: DrillProgramId) => void;
}

const ProgramContext = createContext<ProgramContextValue | undefined>(undefined);
const STORAGE_KEY = "ifrProgramId";

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [programId, setProgramIdState] = useState<DrillProgramId>("custom");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["ipc", "airline", "godmode", "custom"].includes(stored)) {
      setProgramIdState(stored as DrillProgramId);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) localStorage.setItem(STORAGE_KEY, programId);
  }, [programId, isHydrated]);

  return (
    <ProgramContext.Provider value={{ programId, setProgramId: setProgramIdState }}>
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (!context) throw new Error("useProgram must be used within ProgramProvider");
  return context;
}
