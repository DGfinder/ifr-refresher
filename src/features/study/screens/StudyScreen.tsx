"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import type { Module, Section } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { CategoryList } from "@/features/study/components/CategoryList";
import { ModuleList } from "@/features/study/components/ModuleList";
import { ModuleRow } from "@/features/study/components/ModuleRow";
import { ModuleDetail } from "@/features/study/components/ModuleDetail";
import {
  RADIO_GUIDE_SECTION_ID,
  getDrillLinkForModule,
} from "@/features/radio-calls";
import { SearchBar } from "@/features/study/components/SearchBar";
import { SectionSelector } from "@/features/study/components/SectionSelector";
import { SectionPickerSheet } from "@/features/study/components/SectionPickerSheet";
import { ContinueHero } from "@/features/study/components/ContinueHero";
import { sections } from "@/content/registry/sections";
import { useProgress } from "@/features/progress";
import { cn } from "@/shared/lib/cn";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

function StudyPageContent() {
  const { progress, getStatus, setStatus, getCompletionStats } = useProgress();
  const router = useRouter();
  const searchParams = useSearchParams();

  // All sections available in study mode
  const programSections = sections;
  const requestedSectionId = searchParams.get("section");
  const requestedCategoryId = searchParams.get("category");
  const requestedModuleId = searchParams.get("module");
  // When a tag link from a module is followed, seed the search box with
  // the tag so the user lands on the filtered list. Clearing search drops
  // the filter — no separate state slice needed.
  const requestedTag = searchParams.get("tag") ?? "";
  const initialSectionId =
    requestedSectionId && programSections.some((s) => s.sectionId === requestedSectionId)
      ? requestedSectionId
      : programSections[0]?.sectionId ?? "";

  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId);
  const initialSection = programSections.find((section) => section.sectionId === initialSectionId);
  const initialCategoryId =
    requestedCategoryId && initialSection?.categories.some((category) => category.id === requestedCategoryId)
      ? requestedCategoryId
      : null;
  const initialModuleId =
    requestedModuleId && initialSection?.modules.some((moduleItem) => moduleItem.id === requestedModuleId)
      ? requestedModuleId
      : null;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initialModuleId);
  const [searchQuery, setSearchQuery] = useState(requestedTag);

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

  // Guard for the (in practice unreachable) empty-sections case so the rest of
  // the component can treat currentSection as defined. Sections come from the
  // content registry which is validated non-empty by `check-content.mjs`.
  if (!currentSection) return null;

  // Handle section selection
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedCategoryId(null);
    setSelectedModuleId(null);
    setSearchQuery("");
    router.replace(`/study?section=${encodeURIComponent(sectionId)}`, { scroll: false });
  };

  // Handle module selection
  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const categoryParam = selectedCategoryId ? `&category=${encodeURIComponent(selectedCategoryId)}` : "";
    router.replace(
      `/study?section=${encodeURIComponent(currentSection.sectionId)}${categoryParam}&module=${encodeURIComponent(moduleId)}`,
      { scroll: false }
    );
    const currentStatus = getStatus(currentSection.sectionId, moduleId);
    if (currentStatus === "not-started") {
      setStatus(currentSection.sectionId, moduleId, "in-progress");
    }
  };

  // Handle back from detail view
  const handleBack = () => {
    setSelectedModuleId(null);
    const categoryParam = selectedCategoryId ? `&category=${encodeURIComponent(selectedCategoryId)}` : "";
    router.replace(`/study?section=${encodeURIComponent(currentSection.sectionId)}${categoryParam}`, { scroll: false });
  };

  // Handle category selection
  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery("");
    const categoryParam = categoryId ? `&category=${encodeURIComponent(categoryId)}` : "";
    router.replace(`/study?section=${encodeURIComponent(currentSection.sectionId)}${categoryParam}`, { scroll: false });
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
    const practiceLink =
      currentSection.sectionId === RADIO_GUIDE_SECTION_ID
        ? getDrillLinkForModule(selectedModule.id)
        : null;
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-6">
        <ModuleDetail
          module={selectedModule}
          status={moduleStatus}
          sectionId={currentSection.sectionId}
          onBack={handleBack}
          onMarkCompleted={handleMarkCompleted}
          {...(practiceLink ? { practiceLink } : {})}
        />
      </div>
    );
  }

  // Compute per-category stats so the mobile accordion + desktop sidebar
  // can show progress at a glance without re-walking the module list.
  const getCategoryStats = (categoryId: string) => {
    if (!currentSection) return { completed: 0, total: 0 };
    const cat = currentSection.categories.find((c) => c.id === categoryId);
    if (!cat) return { completed: 0, total: 0 };
    const mods = currentSection.modules.filter((m) => cat.moduleIds.includes(m.id));
    const completed = mods.filter(
      (m) => getModuleStatus(m.id) === "completed",
    ).length;
    return { completed, total: mods.length };
  };

  const selectedCategoryTitle = selectedCategoryId
    ? currentSection?.categories.find((c) => c.id === selectedCategoryId)?.title
    : null;

  // Show category/module list view
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      {/* Breadcrumb — sticky path indicator */}
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[var(--ifr-text-muted)] font-normal">
              Study
            </BreadcrumbPage>
          </BreadcrumbItem>
          {currentSection && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentSection.sectionTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {selectedCategoryTitle && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedCategoryTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Continue where you left off — only renders when there are
          in-progress modules. Surfaces above the section picker so a
          returning learner is one tap away from their next read. */}
      <ContinueHero
        sections={programSections}
        progress={progress}
        onResume={(sectionId, moduleId) => {
          if (sectionId !== selectedSectionId) {
            handleSelectSection(sectionId);
          }
          handleSelectModule(moduleId);
        }}
      />

      {/* Mobile: single section-picker pill that opens a bottom sheet */}
      <div className="mb-4 md:hidden">
        <SectionPickerSheet
          sections={programSections}
          selectedSectionId={selectedSectionId}
          onSelectSection={handleSelectSection}
          getCompletionStats={getCompletionStats}
        />
      </div>

      {/* Desktop: keep the grid — works fine, lots of horizontal room */}
      <div className="hidden md:block">
        <SectionSelector
          sections={programSections}
          selectedSectionId={selectedSectionId}
          onSelectSection={handleSelectSection}
          getCompletionStats={getCompletionStats}
        />
      </div>

      {/* Compact section header (replaces the chunky title + description block).
          On a mobile screen the breadcrumb + picker already show the section,
          so the heading shrinks and the long description moves to a popover
          via the section description in the sheet itself. */}
      <header className="mb-4 hidden md:block">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {currentSection?.sectionTitle}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {currentSection?.sectionDescription}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentStats.completed === currentStats.total && currentStats.total > 0
            ? `✓ All ${currentStats.total} modules completed`
            : `${currentStats.completed} of ${currentStats.total} modules completed`}
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search — e.g. 'holding entry', 'alternates', 'minima'..."
        />
      </div>

      {/* Mobile: categories as a vertical accordion with modules nested
          INSIDE each category. Replaces the flat bottom module list — one
          scrollable tree, one tap to read. The desktop sidebar + list
          layout still kicks in at md: and above. */}
      <div className="mb-4 md:hidden">
        <NestedCategoryAccordion
          // Keying on sectionId forces a fresh-state remount when the user
          // switches sections — avoids a set-state-in-effect to reset the
          // open-categories list.
          key={currentSection.sectionId}
          section={currentSection}
          searchQuery={searchQuery}
          getModuleStatus={getModuleStatus}
          getCategoryStats={getCategoryStats}
          onSelectModule={handleSelectModule}
        />
      </div>

      {/* Desktop main content area — sidebar + flat module list. Mobile
          renders the nested accordion above instead. */}
      <div className="hidden gap-8 md:flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-6 rounded-lg bg-[var(--ifr-surface-muted)] p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h2>
            <CategoryList
              categories={currentSection?.categories ?? []}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
              getCategoryStats={getCategoryStats}
            />
          </div>
        </aside>

        {/* Module list */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategoryTitle ?? "All Modules"}
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
        </div>
      </div>
    </div>
  );
}

interface NestedCategoryAccordionProps {
  section: Section;
  searchQuery: string;
  getModuleStatus: (moduleId: string) => ModuleStatus;
  getCategoryStats: (categoryId: string) => { completed: number; total: number };
  onSelectModule: (moduleId: string) => void;
}

/**
 * Mobile-only accordion that renders modules nested inside each category.
 *
 * Behaviour:
 *  - On mount, default-expand the first category that isn't fully completed
 *    so the user lands on something actionable.
 *  - Completed categories (all modules done) show a green ✓ and stay
 *    collapsed by default.
 *  - When the learner types in the search box, all categories with matching
 *    modules force-expand to show the hits.
 *  - Manual toggles are remembered; search override is computed on top.
 */
function NestedCategoryAccordion({
  section,
  searchQuery,
  getModuleStatus,
  getCategoryStats,
  onSelectModule,
}: NestedCategoryAccordionProps) {
  // Per-category matching modules. When the search box is empty, every
  // category's full module list is "matching". When the box has text, the
  // matching list is filtered by a case-insensitive substring across title
  // + summary + tags (kept identical to ModuleList's pre-Fuse fallback so
  // results stay consistent across the two surfaces).
  const matchesByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const byId = new Map(section.modules.map((m) => [m.id, m]));
    return section.categories.map((cat) => {
      const mods = cat.moduleIds
        .map((id) => byId.get(id))
        .filter((m): m is Module => Boolean(m));
      if (!q) return { category: cat, modules: mods };
      const filtered = mods.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)),
      );
      return { category: cat, modules: filtered };
    });
  }, [section, searchQuery]);

  // Default-expand the first category that isn't fully completed. Falls
  // back to the first category if everything's done. Computed once via
  // useState's lazy initialiser — the component is re-mounted (via
  // `key={sectionId}` from the parent) whenever the section changes, so
  // the initial state always reflects the current section.
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    for (const cat of section.categories) {
      const mods = cat.moduleIds;
      if (mods.length === 0) continue;
      const completed = mods.filter(
        (id) => getModuleStatus(id) === "completed",
      ).length;
      if (completed < mods.length) return [cat.id];
    }
    const first = section.categories[0]?.id;
    return first ? [first] : [];
  });

  // When search is active, force-open every category with matches. When
  // empty, fall back to the user's manual toggles.
  const effectiveOpen = useMemo(() => {
    if (!searchQuery.trim()) return openCategories;
    return matchesByCategory
      .filter(({ modules }) => modules.length > 0)
      .map(({ category }) => category.id);
  }, [searchQuery, openCategories, matchesByCategory]);

  // Hide categories with no matches when searching so we don't render empty
  // expanded sections at the bottom.
  const visible = searchQuery.trim()
    ? matchesByCategory.filter(({ modules }) => modules.length > 0)
    : matchesByCategory;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 text-center text-sm text-[var(--ifr-text-muted)]">
        No modules match &ldquo;{searchQuery}&rdquo; in this section.
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      value={effectiveOpen}
      onValueChange={setOpenCategories}
      className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-4"
    >
      {visible.map(({ category, modules }) => {
        const stats = getCategoryStats(category.id);
        const isComplete = stats.total > 0 && stats.completed === stats.total;
        return (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger>
              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  {isComplete && (
                    <Check
                      size={14}
                      className="shrink-0 text-[var(--ifr-success)]"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      isComplete
                        ? "text-[var(--ifr-text-muted)]"
                        : "text-[var(--ifr-text)]",
                    )}
                  >
                    {category.title}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium text-[var(--ifr-text-muted)]">
                  {stats.completed}/{stats.total}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {category.description && (
                <p className="mb-2 text-xs text-[var(--ifr-text-muted)]">
                  {category.description}
                </p>
              )}
              <ul className="space-y-2" aria-label={`${category.title} modules`}>
                {modules.map((mod) => (
                  <li key={mod.id}>
                    <ModuleRow
                      module={mod}
                      status={getModuleStatus(mod.id)}
                      onSelect={() => onSelectModule(mod.id)}
                    />
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function StudyScreen() {
  return (
    <Suspense fallback={null}>
      <StudyPageContent />
    </Suspense>
  );
}
