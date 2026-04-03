"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { DrillProgramId } from "@/types/drill";
import { storage } from "@/lib/storage";

interface ProgramContextValue {
  programId: DrillProgramId;
  setProgramId: (id: DrillProgramId) => void;
}

const ProgramContext = createContext<ProgramContextValue | undefined>(undefined);
const STORAGE_KEY = "ifrProgramId";

const VALID_PROGRAM_IDS: DrillProgramId[] = ["ipc", "airline", "godmode", "custom", "cheat_sheet"];

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [programId, setProgramIdState] = useState<DrillProgramId>("custom");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await storage.get<string>(STORAGE_KEY);
      if (stored && VALID_PROGRAM_IDS.includes(stored as DrillProgramId)) {
        setProgramIdState(stored as DrillProgramId);
      }
      setIsHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      storage.set(STORAGE_KEY, programId).catch(console.error);
    }
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
