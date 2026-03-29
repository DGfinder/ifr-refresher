"use client";

import { useState, useMemo } from "react";
import { CategoryList } from "@/components/CategoryList";
import { ModuleList } from "@/components/ModuleList";
import { ModuleDetail } from "@/components/ModuleDetail";
import { SearchBar } from "@/components/SearchBar";
import { SectionSelector } from "@/components/SectionSelector";
import { sections } from "@/data/sections";
import { useProgress } from "@/hooks/useProgress";

export default function StudyPage() {
  const { getStatus, setStatus, getCompletionStats } = useProgress();

  // All sections available in study mode
  const programSections = sections;

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
