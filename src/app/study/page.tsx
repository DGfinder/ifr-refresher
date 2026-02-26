"use client";

import { useState, useMemo } from "react";
import { CategoryList } from "@/components/CategoryList";
import { ModuleList } from "@/components/ModuleList";
import { ModuleDetail } from "@/components/ModuleDetail";
import { SearchBar } from "@/components/SearchBar";
import { SectionSelector } from "@/components/SectionSelector";
import { ProgramFilter } from "@/components/ProgramFilter";
import { sections } from "@/data/sections";
import { getSectionsForProgram } from "@/data/drillPrograms";
import { useProgram } from "@/contexts/ProgramContext";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

export default function StudyPage() {
  const { programId, setProgramId } = useProgram();
  const { getStatus, setStatus, getCompletionStats } = useProgress();
  const [showFilters, setShowFilters] = useState(false);

  // Filter sections by program (godmode/custom shows all by default)
  const programSections = useMemo(() => {
    const ids = getSectionsForProgram(programId, sections.map((s) => s.sectionId));
    return sections.filter((s) => ids.includes(s.sectionId));
  }, [programId]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    programSections[0]?.sectionId ?? ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current section
  const currentSection = useMemo(() => {
    return programSections.find((s) => s.sectionId === selectedSectionId) ?? programSections[0];
  }, [selectedSectionId, programSections]);

  // Get selected module
  const selectedModule = useMemo(() => {
    if (!selectedModuleId || !currentSection) return null;
    return currentSection.modules.find((m) => m.id === selectedModuleId) || null;
  }, [selectedModuleId, currentSection]);

  // Filter modules by category
  const filteredModules = useMemo(() => {
    if (!currentSection) return [];
    if (!selectedCategoryId) return currentSection.modules;
    const category = currentSection.categories.find((c) => c.id === selectedCategoryId);
    if (!category) return currentSection.modules;
    return currentSection.modules.filter((m) => category.moduleIds.includes(m.id));
  }, [selectedCategoryId, currentSection]);

  // Get completion stats for current section
  const currentStats = useMemo(() => {
    if (!currentSection) return { completed: 0, total: 0 };
    return getCompletionStats(currentSection.sectionId, currentSection.modules);
  }, [currentSection, getCompletionStats]);

  // Handle section selection
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedCategoryId(null);
    setSelectedModuleId(null);
    setSearchQuery("");
  };

  // Handle module selection
  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const currentStatus = getStatus(currentSection.sectionId, moduleId);
    if (currentStatus === "not-started") {
      setStatus(currentSection.sectionId, moduleId, "in-progress");
    }
  };

  // Handle back from detail view
  const handleBack = () => {
    setSelectedModuleId(null);
  };

  // Handle category selection
  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery("");
  };

  // Handle mark as completed
  const handleMarkCompleted = () => {
    if (selectedModuleId) {
      setStatus(currentSection.sectionId, selectedModuleId, "completed");
    }
  };

  // Get module status helper
  const getModuleStatus = (moduleId: string) => {
    return getStatus(currentSection.sectionId, moduleId);
  };

  // Show module detail view
  if (selectedModule) {
    const moduleStatus = getStatus(currentSection.sectionId, selectedModule.id);
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        <ModuleDetail
          module={selectedModule}
          status={moduleStatus}
          onBack={handleBack}
          onMarkCompleted={handleMarkCompleted}
        />
      </div>
    );
  }

  // Show category/module list view
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      {/* Filter toggle */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
            showFilters
              ? "border-[var(--ifr-accent)] bg-[var(--ifr-accent)]/10 text-[var(--ifr-accent)]"
              : "border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text-muted)] hover:border-[var(--ifr-accent)]/50"
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter by Program
          {programId !== "godmode" && (
            <span className="rounded-full bg-[var(--ifr-accent)] px-1.5 py-0.5 text-xs text-white">
              1
            </span>
          )}
        </button>
      </div>

      {/* Collapsible filter panel */}
      {showFilters && (
        <div className="mb-6 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4">
          <ProgramFilter
            programId={programId}
            onProgramChange={setProgramId}
          />
        </div>
      )}

      {/* Section selector */}
      <SectionSelector
        sections={programSections}
        selectedSectionId={selectedSectionId}
        onSelectSection={handleSelectSection}
        getCompletionStats={getCompletionStats}
      />

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {currentSection?.sectionTitle}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {currentSection?.sectionDescription}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentStats.completed}/{currentStats.total} modules completed
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search modules by title, tags, or summary..."
        />
      </div>

      {/* Categories (mobile: horizontal scroll) */}
      <div className="mb-6 md:hidden">
        <CategoryList
          categories={currentSection?.categories ?? []}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Main content area */}
      <div className="flex gap-8">
        {/* Sidebar (desktop only) */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 rounded-lg bg-[var(--ifr-surface-muted)] p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h2>
            <CategoryList
              categories={currentSection?.categories ?? []}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />
          </div>
        </aside>

        {/* Module list */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategoryId
                ? currentSection?.categories.find((c) => c.id === selectedCategoryId)?.title ||
                  "Modules"
                : "All Modules"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredModules.length} module
              {filteredModules.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ModuleList
            modules={filteredModules}
            searchQuery={searchQuery}
            onSelectModule={handleSelectModule}
            getModuleStatus={getModuleStatus}
          />
        </main>
      </div>
    </div>
  );
}
