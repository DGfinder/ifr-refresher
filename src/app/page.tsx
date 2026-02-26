"use client";

import { useState, useMemo } from "react";
import { CategoryList } from "@/components/CategoryList";
import { ModuleList } from "@/components/ModuleList";
import { ModuleDetail } from "@/components/ModuleDetail";
import { SearchBar } from "@/components/SearchBar";
import { SectionSelector } from "@/components/SectionSelector";
import { DrillView } from "@/components/DrillView";
import { DrillProgramSelector } from "@/components/DrillProgramSelector";
import { QuizView } from "@/components/QuizView";
import { AppHeader } from "@/components/AppHeader";
import { ProgressStrip } from "@/components/ProgressStrip";
import { sections } from "@/data/sections";
import { drillPrograms, getSectionsForProgram } from "@/data/drillPrograms";
import { useProgress } from "@/hooks/useProgress";
import { useDrill } from "@/hooks/useDrill";
import { cn } from "@/lib/utils";
import type { DrillProgramId } from "@/types/drill";

type ViewMode = "study" | "drill";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("study");
  const [drillWeakFocus, setDrillWeakFocus] = useState(false);
  const [drillSubMode, setDrillSubMode] = useState<"flashcards" | "quiz">("flashcards");
  const [activeProgramId, setActiveProgramId] = useState<DrillProgramId>("custom");
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.sectionId ?? ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { getStatus, setStatus, getCompletionStats } = useProgress();
  const { getWeakCount } = useDrill(sections);

  // Compute filtered sections based on active program
  const programSectionIds = useMemo(() => {
    return getSectionsForProgram(activeProgramId, sections.map((s) => s.sectionId));
  }, [activeProgramId]);

  const programSections = useMemo(() => {
    return sections.filter((s) => programSectionIds.includes(s.sectionId));
  }, [programSectionIds]);

  // Handle program change - set defaults
  const handleProgramChange = (id: DrillProgramId) => {
    const program = drillPrograms.find((p) => p.id === id);
    setActiveProgramId(id);
    if (program) setDrillSubMode(program.defaultMode);
  };

  // Compute total completion stats across all sections
  const totalStats = useMemo(() => {
    const totalModules = sections.reduce((acc, s) => acc + s.modules.length, 0);
    const completedModules = sections.reduce((acc, s) => {
      const stats = getCompletionStats(s.sectionId, s.modules);
      return acc + stats.completed;
    }, 0);
    return { completed: completedModules, total: totalModules };
  }, [getCompletionStats]);

  // Get current section
  const currentSection = useMemo(() => {
    return sections.find((s) => s.sectionId === selectedSectionId) ?? sections[0];
  }, [selectedSectionId]);

  // Get selected module
  const selectedModule = useMemo(() => {
    if (!selectedModuleId || !currentSection) return null;
    return currentSection.modules.find((m) => m.id === selectedModuleId) || null;
  }, [selectedModuleId, currentSection]);

  // Filter modules by category
  const filteredModules = useMemo(() => {
    if (!currentSection) return [];
    if (!selectedCategoryId) return currentSection.modules;
    const category = currentSection.categories.find(
      (c) => c.id === selectedCategoryId
    );
    if (!category) return currentSection.modules;
    return currentSection.modules.filter((m) =>
      category.moduleIds.includes(m.id)
    );
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
    // Auto-mark as in-progress if not-started
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
    setSearchQuery(""); // Clear search when changing category
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

  // Handle weak questions click
  const handleWeakQuestionsClick = () => {
    setViewMode("drill");
    setDrillWeakFocus(true);
  };

  // View toggle component
  const ViewToggle = () => (
    <div className="mb-6 flex justify-center">
      <div className="inline-flex rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-0.5">
        <button
          onClick={() => { setViewMode("study"); setDrillWeakFocus(false); }}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            viewMode === "study"
              ? "bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
              : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
          )}
        >
          Study
        </button>
        <button
          onClick={() => { setViewMode("drill"); setDrillWeakFocus(false); }}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            viewMode === "drill"
              ? "bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
              : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
          )}
        >
          Drill
        </button>
      </div>
    </div>
  );

  // Show module detail view (only in study mode)
  if (viewMode === "study" && selectedModule) {
    const moduleStatus = getStatus(currentSection.sectionId, selectedModule.id);
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1100px] px-6 py-6">
          <AppHeader />
          <ProgressStrip
            completedModules={totalStats.completed}
            totalModules={totalStats.total}
            weakCount={getWeakCount()}
            onWeakQuestionsClick={handleWeakQuestionsClick}
          />
          <ModuleDetail
            module={selectedModule}
            status={moduleStatus}
            onBack={handleBack}
            onMarkCompleted={handleMarkCompleted}
          />
        </div>
      </div>
    );
  }

  // Show drill view
  if (viewMode === "drill") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1100px] px-6 py-6">
          <AppHeader />
          <ProgressStrip
            completedModules={totalStats.completed}
            totalModules={totalStats.total}
            weakCount={getWeakCount()}
            onWeakQuestionsClick={handleWeakQuestionsClick}
          />
          <ViewToggle />

          {/* Drill Program Selector */}
          <DrillProgramSelector
            programs={drillPrograms}
            selectedProgramId={activeProgramId}
            onSelectProgram={handleProgramChange}
          />

          {/* Flashcards / Quiz toggle */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-0.5">
              <button
                onClick={() => setDrillSubMode("flashcards")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  drillSubMode === "flashcards"
                    ? "bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
                    : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
                )}
              >
                Flashcards
              </button>
              <button
                onClick={() => setDrillSubMode("quiz")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  drillSubMode === "quiz"
                    ? "bg-[var(--ifr-surface-muted)] text-[var(--ifr-accent)]"
                    : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
                )}
              >
                Quiz
              </button>
            </div>
          </div>

          {/* Render DrillView or QuizView based on sub-mode */}
          {drillSubMode === "flashcards" ? (
            <DrillView sections={programSections} focusWeak={drillWeakFocus} />
          ) : (
            <QuizView sections={programSections} programId={activeProgramId} />
          )}
        </div>
      </div>
    );
  }

  // Show category/module list view (study mode)
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        {/* App header */}
        <AppHeader />

        {/* Progress strip */}
        <ProgressStrip
          completedModules={totalStats.completed}
          totalModules={totalStats.total}
          weakCount={getWeakCount()}
          onWeakQuestionsClick={handleWeakQuestionsClick}
        />

        {/* View toggle */}
        <ViewToggle />

        {/* Section selector */}
        <SectionSelector
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={handleSelectSection}
          getCompletionStats={getCompletionStats}
        />

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {currentSection.sectionTitle}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {currentSection.sectionDescription}
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
            categories={currentSection.categories}
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
                categories={currentSection.categories}
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
                  ? currentSection.categories.find(
                      (c) => c.id === selectedCategoryId
                    )?.title || "Modules"
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
    </div>
  );
}
