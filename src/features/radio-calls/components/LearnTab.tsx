"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import type { Module, Section } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { useProgress } from "@/features/progress";
import { ModuleDetail, ModuleRow, SearchBar } from "@/features/study";
import { cn } from "@/shared/lib/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { getDrillLinkForModule } from "@/features/radio-calls/model/guideMapping";

interface LearnTabProps {
  section: Section;
  /** Initial module to show open. Null = list view. */
  initialModuleId: string | null;
  /** Initial tag filter (from `?tag=` URL param). */
  initialTag: string;
  /** Notified when the open module changes, including back-to-list (null).
   * Lets the parent screen mirror the state in the URL. */
  onModuleChange: (moduleId: string | null) => void;
}

/**
 * Phraseology theory tab — the radio-calls study section, in-page.
 *
 * The 13 RADIO-* modules live here instead of under /study so the learn →
 * drill → fly loop is one tap each. State and routing match the Study
 * screen's nested-accordion mobile pattern; tag clicks stay inside the
 * /radio?tab=learn URL space.
 */
export function LearnTab({
  section,
  initialModuleId,
  initialTag,
  onModuleChange,
}: LearnTabProps) {
  const { getStatus, setStatus, getCompletionStats } = useProgress();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    initialModuleId,
  );
  const [searchQuery, setSearchQuery] = useState(initialTag);

  const selectedModule = useMemo(
    () =>
      selectedModuleId
        ? section.modules.find((m) => m.id === selectedModuleId) ?? null
        : null,
    [section.modules, selectedModuleId],
  );

  const getModuleStatus = (moduleId: string): ModuleStatus =>
    getStatus(section.sectionId, moduleId);

  const getCategoryStats = (categoryId: string) => {
    const cat = section.categories.find((c) => c.id === categoryId);
    if (!cat) return { completed: 0, total: 0 };
    const mods = section.modules.filter((m) =>
      cat.moduleIds.includes(m.id),
    );
    const completed = mods.filter(
      (m) => getModuleStatus(m.id) === "completed",
    ).length;
    return { completed, total: mods.length };
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    onModuleChange(moduleId);
    if (getStatus(section.sectionId, moduleId) === "not-started") {
      setStatus(section.sectionId, moduleId, "in-progress");
    }
  };

  const handleBack = () => {
    setSelectedModuleId(null);
    onModuleChange(null);
  };

  const handleMarkCompleted = () => {
    if (selectedModuleId) {
      setStatus(section.sectionId, selectedModuleId, "completed");
    }
  };

  if (selectedModule) {
    const moduleStatus = getStatus(section.sectionId, selectedModule.id);
    const practiceLink = getDrillLinkForModule(selectedModule.id);
    const currentIndex = section.modules.findIndex(
      (m) => m.id === selectedModule.id,
    );
    const findUnread = (start: number, end: number) => {
      for (let i = start; i < end; i++) {
        const candidate = section.modules[i];
        if (
          candidate &&
          getStatus(section.sectionId, candidate.id) !== "completed"
        ) {
          return candidate;
        }
      }
      return null;
    };
    const total = section.modules.length;
    const nextModule =
      findUnread(currentIndex + 1, total) ?? findUnread(0, currentIndex);
    const nextSuggestion = nextModule
      ? {
          id: nextModule.id,
          title: nextModule.title,
          estReadingMinutes: nextModule.estReadingMinutes,
        }
      : null;

    return (
      <div className="mx-auto max-w-2xl px-6 pb-6">
        <ModuleDetail
          module={selectedModule}
          status={moduleStatus}
          sectionId={section.sectionId}
          onBack={handleBack}
          onMarkCompleted={handleMarkCompleted}
          {...(practiceLink ? { practiceLink } : {})}
          nextModule={nextSuggestion}
          onSelectNextModule={handleSelectModule}
          getTagHref={(tag) =>
            `/radio?tab=learn&tag=${encodeURIComponent(tag)}`
          }
          speakable
        />
      </div>
    );
  }

  const sectionStats = getCompletionStats(section.sectionId, section.modules);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 pb-6">
      <div className="rounded-xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 p-4">
        <p className="text-sm font-semibold text-[var(--ifr-text)]">
          Phraseology theory
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ifr-text-muted)]">
          The AIP-sourced phrase families behind every drill — standard
          phrases, mandatory readbacks, and the format for each call type.
        </p>
        <p className="mt-2 text-xs text-[var(--ifr-text-muted)]">
          {sectionStats.completed} of {sectionStats.total} modules read
        </p>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search phrases — 'readback', 'CTAF', 'mayday'..."
      />

      <LearnCategoryAccordion
        // Force a fresh-state remount if the section is ever swapped out.
        key={section.sectionId}
        section={section}
        searchQuery={searchQuery}
        getModuleStatus={getModuleStatus}
        getCategoryStats={getCategoryStats}
        onSelectModule={handleSelectModule}
      />
    </div>
  );
}

interface LearnCategoryAccordionProps {
  section: Section;
  searchQuery: string;
  getModuleStatus: (moduleId: string) => ModuleStatus;
  getCategoryStats: (categoryId: string) => { completed: number; total: number };
  onSelectModule: (moduleId: string) => void;
}

/**
 * Same nested-accordion pattern as the /study mobile view, but tuned for
 * the smaller radio-calls section (7 categories, 13 modules). The first
 * not-fully-completed category opens by default; search force-expands
 * matching categories.
 */
function LearnCategoryAccordion({
  section,
  searchQuery,
  getModuleStatus,
  getCategoryStats,
  onSelectModule,
}: LearnCategoryAccordionProps) {
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

  const effectiveOpen = useMemo(() => {
    if (!searchQuery.trim()) return openCategories;
    return matchesByCategory
      .filter(({ modules }) => modules.length > 0)
      .map(({ category }) => category.id);
  }, [searchQuery, openCategories, matchesByCategory]);

  const visible = searchQuery.trim()
    ? matchesByCategory.filter(({ modules }) => modules.length > 0)
    : matchesByCategory;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 text-center text-sm text-[var(--ifr-text-muted)]">
        No phrase families match &ldquo;{searchQuery}&rdquo;.
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
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--ifr-text-muted)]">
                  <span>
                    {stats.completed}/{stats.total}
                  </span>
                  <ChevronRight size={12} aria-hidden="true" />
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {category.description && (
                <p className="mb-2 text-xs text-[var(--ifr-text-muted)]">
                  {category.description}
                </p>
              )}
              <ul
                className="space-y-2"
                aria-label={`${category.title} modules`}
              >
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
