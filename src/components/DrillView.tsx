"use client";

import { useState, useEffect, useMemo } from "react";
import type { Section } from "@/types/section";
import type { DrillQuestion, DrillRating } from "@/types/drill";
import { useDrill } from "@/hooks/useDrill";
import { DrillCard } from "./DrillCard";

interface DrillViewProps {
  sections: Section[];
  focusWeak?: boolean;
}

export function DrillView({ sections, focusWeak = false }: DrillViewProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DrillQuestion | null>(null);

  const {
    filteredQuestions,
    getNextQuestion,
    updateRating,
    getWeakCount,
    getSeenCount,
  } = useDrill(sections, {
    sectionId: selectedSectionId,
    moduleId: selectedModuleId,
  });

  // Get modules for selected section
  const availableModules = useMemo(() => {
    if (!selectedSectionId) return [];
    const section = sections.find((s) => s.sectionId === selectedSectionId);
    return section?.modules || [];
  }, [sections, selectedSectionId]);

  // Load first question when filters change
  useEffect(() => {
    setCurrentQuestion(getNextQuestion());
  }, [selectedSectionId, selectedModuleId, getNextQuestion]);

  // Handle section change
  const handleSectionChange = (sectionId: string) => {
    const newSectionId = sectionId === "" ? null : sectionId;
    setSelectedSectionId(newSectionId);
    setSelectedModuleId(null);
  };

  // Handle module change
  const handleModuleChange = (moduleId: string) => {
    setSelectedModuleId(moduleId === "" ? null : moduleId);
  };

  // Handle rating
  const handleRate = (rating: DrillRating) => {
    if (currentQuestion) {
      updateRating(currentQuestion.id, rating);
      setCurrentQuestion(getNextQuestion());
    }
  };

  const seenCount = getSeenCount();
  const weakCount = getWeakCount();

  return (
    <div className="mx-auto max-w-2xl">
      {focusWeak && (
        <div className="mb-4 rounded-md border border-[var(--ifr-warning)]/40 bg-[var(--ifr-surface-muted)] px-3 py-2 text-xs text-[var(--ifr-warning)]">
          Weak review mode - prioritising questions you've marked as unsure.
        </div>
      )}
      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Section dropdown */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="section-filter"
            className="w-20 shrink-0 text-sm font-medium text-muted-foreground"
          >
            Section:
          </label>
          <select
            id="section-filter"
            value={selectedSectionId || ""}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All sections</option>
            {sections.map((section) => (
              <option key={section.sectionId} value={section.sectionId}>
                {section.sectionTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Module dropdown */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="module-filter"
            className="w-20 shrink-0 text-sm font-medium text-muted-foreground"
          >
            Module:
          </label>
          <select
            id="module-filter"
            value={selectedModuleId || ""}
            onChange={(e) => handleModuleChange(e.target.value)}
            disabled={!selectedSectionId}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All modules</option>
            {availableModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.id}: {module.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 text-sm text-muted-foreground">
        Seen: {seenCount} question{seenCount !== 1 ? "s" : ""} · Weak: {weakCount}
      </div>

      {/* Question card or empty state */}
      {currentQuestion ? (
        <DrillCard question={currentQuestion} onRate={handleRate} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No questions available
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredQuestions.length === 0
              ? "Try adjusting your filters to find questions."
              : "You've completed all questions in this selection!"}
          </p>
        </div>
      )}

      {/* Question count */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} in
        selection
      </div>
    </div>
  );
}
