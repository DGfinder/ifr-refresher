"use client";

import { useState } from "react";
import type { Section } from "@/types/section";
import { cn } from "@/lib/utils";

interface CollapsibleFiltersProps {
  sections: Section[];
  selectedSectionId: string | null;
  selectedModuleId: string | null;
  onSectionChange: (sectionId: string | null) => void;
  onModuleChange: (moduleId: string | null) => void;
}

export function CollapsibleFilters({
  sections,
  selectedSectionId,
  selectedModuleId,
  onSectionChange,
  onModuleChange,
}: CollapsibleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSection = sections.find((s) => s.sectionId === selectedSectionId);
  const modules = currentSection?.modules ?? [];

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
      >
        <span
          className={cn(
            "transition-transform",
            isOpen ? "rotate-90" : ""
          )}
        >
          &#9654;
        </span>
        Filters
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--ifr-text-muted)]">
              Section
            </label>
            <select
              value={selectedSectionId ?? ""}
              onChange={(e) => {
                onSectionChange(e.target.value || null);
                onModuleChange(null);
              }}
              className="w-full rounded-md border border-[var(--ifr-border)] bg-[var(--ifr-bg)] px-3 py-1.5 text-sm text-[var(--ifr-text)]"
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.sectionTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--ifr-text-muted)]">
              Module
            </label>
            <select
              value={selectedModuleId ?? ""}
              onChange={(e) => onModuleChange(e.target.value || null)}
              disabled={!selectedSectionId}
              className={cn(
                "w-full rounded-md border border-[var(--ifr-border)] bg-[var(--ifr-bg)] px-3 py-1.5 text-sm text-[var(--ifr-text)]",
                !selectedSectionId && "opacity-50"
              )}
            >
              <option value="">All modules</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
