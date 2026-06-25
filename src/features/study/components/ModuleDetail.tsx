"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Brain,
  BookOpen,
  Library,
  Radio,
  Sparkles,
} from "lucide-react";
import type { ContentBlock as ContentBlockType, Module } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { Badge } from "@/shared/ui/Badge";
import { ContentBlock } from "@/content/components/ContentBlock";
import { References } from "@/content/components/References";
import { SectionToc } from "@/content/components/SectionToc";
import { StatusIndicator } from "@/features/progress";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ReadingProgress } from "@/features/study/components/ReadingProgress";
import { useStudyBookmarks } from "@/features/study/hooks/useStudyBookmarks";

interface PracticeLink {
  href: string;
  label: string;
}

interface NextModuleSuggestion {
  id: string;
  title: string;
  estReadingMinutes: number;
}

interface ModuleDetailProps {
  module: Module;
  status: ModuleStatus;
  /** Section id for tag-link routing. */
  sectionId: string;
  onBack: () => void;
  onMarkCompleted: () => void;
  /** Optional CTA shown in the Reference tab — used by radio-calls modules
   * to deep-link into the matching Drill tab filter. */
  practiceLink?: PracticeLink;
  /** When this module is completed (or already was), surface this as the
   * "next" module so the learner doesn't have to backtrack to the list. */
  nextModule?: NextModuleSuggestion | null;
  /** Called when the learner taps the next-module CTA. */
  onSelectNextModule?: (moduleId: string) => void;
  /** Override how tag chips link out. Default routes to /study filtered by
   * tag; the radio-calls Learn tab passes its own builder so taps stay
   * inside /radio?tab=learn. */
  getTagHref?: (tag: string) => string;
  /** When true, render 🔊 buttons next to quoted phraseology inside law /
   * list blocks. Used by the radio-calls Learn tab to surface canonical
   * pronunciation of each call. */
  speakable?: boolean;
}

/** Block types that belong on the Read tab — passive study content. */
const READ_TYPES = new Set<ContentBlockType["type"]>([
  "heading",
  "text",
  "list",
  "hierarchy",
  "law",
  "numbers",
  "ops_context",
  "traps",
  "scenario",
]);

/** Block types that belong on the Drill tab — active-recall content. */
const DRILL_TYPES = new Set<ContentBlockType["type"]>([
  "qa",
  "ipc_questions",
  "airline_questions",
]);

/** Block types that belong on the Reference tab — sources, related material. */
const REFERENCE_TYPES = new Set<ContentBlockType["type"]>(["reference"]);

type TabValue = "read" | "drill" | "reference";

export function orderContentBlocksForStudy(
  blocks: readonly ContentBlockType[],
): ContentBlockType[] {
  // Kept for backwards compat — used by tests + by code paths that still
  // want a single linear ordering. Tab-based reader builds its own per-tab
  // partition via the *_TYPES sets above.
  const studyContent = blocks.filter((block) => !DRILL_TYPES.has(block.type));
  const activeRecall = blocks.filter((block) => DRILL_TYPES.has(block.type));
  return [...studyContent, ...activeRecall];
}

export function ModuleDetail({
  module,
  status,
  sectionId,
  onBack,
  onMarkCompleted,
  practiceLink,
  nextModule,
  onSelectNextModule,
  getTagHref,
  speakable = false,
}: ModuleDetailProps) {
  const resolveTagHref =
    getTagHref ??
    ((tag: string) =>
      `/study?section=${encodeURIComponent(sectionId)}&tag=${encodeURIComponent(tag)}`);

  const {
    isBookmarked,
    isPending: isBookmarkPending,
    toggleBookmark,
    isLoaded: bookmarksLoaded,
  } = useStudyBookmarks();
  const bookmarked = bookmarksLoaded && isBookmarked(sectionId, module.id);
  const bookmarkPending = isBookmarkPending(sectionId, module.id);

  // Partition the module's content blocks once per render. Order within each
  // partition matches authoring order — we never re-sort the source content.
  const { readBlocks, drillBlocks, referenceBlocks } = useMemo(() => {
    const read: ContentBlockType[] = [];
    const drill: ContentBlockType[] = [];
    const ref: ContentBlockType[] = [];
    for (const block of module.content) {
      if (READ_TYPES.has(block.type)) read.push(block);
      else if (DRILL_TYPES.has(block.type)) drill.push(block);
      else if (REFERENCE_TYPES.has(block.type)) ref.push(block);
    }
    return { readBlocks: read, drillBlocks: drill, referenceBlocks: ref };
  }, [module.content]);

  // Count the prompts inside the IPC / airline blocks so the Drill tab can
  // show "Drill (12)" instead of just "Drill". Plain qa blocks count as 1
  // each; ipc_questions / airline_questions contain a string per question.
  const drillCount = useMemo(() => {
    let count = 0;
    for (const block of drillBlocks) {
      if (block.type === "qa") count += 1;
      else if (block.type === "ipc_questions" || block.type === "airline_questions") {
        count += block.content.length;
      }
    }
    return count;
  }, [drillBlocks]);

  const showDrillTab = drillBlocks.length > 0;
  const showReferenceTab =
    referenceBlocks.length > 0 || module.refs.length > 0 || Boolean(practiceLink);

  const [activeTab, setActiveTab] = useState<TabValue>("read");

  return (
    <div className="mx-auto max-w-3xl">
      {/* Sticky reading-progress bar — remounts on module OR tab change so
          the bar resets when content swaps under the scroll position. */}
      <ReadingProgress trackingKey={`${module.id}:${activeTab}`} />

      {/* Header */}
      <div className="mb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 -ml-2 h-auto gap-1 px-2 py-1 text-sm font-normal text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to modules
        </Button>

        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-2xl font-bold text-[var(--ifr-text)] md:text-3xl">
            {module.title}
          </h1>
          <Badge variant={module.level} className="mt-1">
            {module.level}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--ifr-text-muted)]">
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {module.estReadingMinutes} min read
          </span>
          <span className="flex items-center gap-1.5">
            <StatusIndicator status={status} size="sm" />
            <span className="capitalize">{status.replace("-", " ")}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              void toggleBookmark(sectionId, module.id);
            }}
            aria-pressed={bookmarked}
            aria-busy={bookmarkPending || undefined}
            aria-label={bookmarked ? "Remove from saved" : "Save for review"}
            disabled={bookmarkPending}
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
              "disabled:cursor-progress disabled:opacity-70",
              bookmarked
                ? "text-[var(--ifr-accent)] hover:text-[var(--ifr-accent)]/80"
                : "text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]",
            )}
          >
            {bookmarked ? (
              <BookmarkCheck size={14} aria-hidden="true" />
            ) : (
              <Bookmark size={14} aria-hidden="true" />
            )}
            <span className="text-xs">{bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>

        {module.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {module.tags.map((tag) => (
              <Link
                key={tag}
                href={resolveTagHref(tag)}
                className={cn(
                  "rounded-md bg-[var(--ifr-surface-muted)] px-2.5 py-1 text-sm text-[var(--ifr-text)]",
                  "transition-colors hover:bg-[var(--ifr-accent)]/15 hover:text-[var(--ifr-accent)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
                )}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Summary — always visible above the tabs. One sentence that frames
          why the learner is here, regardless of which tab they're on. */}
      <div className="mb-5 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)]/30 p-4">
        <p className="text-[var(--ifr-text)]/90">{module.summary}</p>
      </div>

      {/* Tabs: Read (passive study) · Drill (active recall) · Reference (sources + cross-links) */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="block"
      >
        <TabsList className="mb-5 flex w-full">
          <TabsTrigger value="read" className="flex-1 gap-2">
            <BookOpen size={14} aria-hidden="true" />
            <span>Read</span>
          </TabsTrigger>
          {showDrillTab && (
            <TabsTrigger value="drill" className="flex-1 gap-2">
              <Brain size={14} aria-hidden="true" />
              <span>Drill</span>
              {drillCount > 0 && (
                <span className="rounded-full bg-[var(--ifr-accent)]/15 px-1.5 text-[10px] font-semibold text-[var(--ifr-accent)]">
                  {drillCount}
                </span>
              )}
            </TabsTrigger>
          )}
          {showReferenceTab && (
            <TabsTrigger value="reference" className="flex-1 gap-2">
              <Library size={14} aria-hidden="true" />
              <span>Reference</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="read" className="mt-0">
          <ReadTab
            anchorPrefix={`${module.id}:read`}
            blocks={readBlocks}
            speakable={speakable}
            status={status}
            onMarkCompleted={onMarkCompleted}
            {...(nextModule !== undefined ? { nextModule } : {})}
            {...(onSelectNextModule ? { onSelectNextModule } : {})}
          />
        </TabsContent>

        {showDrillTab && (
          <TabsContent value="drill" className="mt-0">
            <DrillTab
              anchorPrefix={`${module.id}:drill`}
              blocks={drillBlocks}
              hasPracticeLink={Boolean(practiceLink)}
            />
          </TabsContent>
        )}

        {showReferenceTab && (
          <TabsContent value="reference" className="mt-0">
            <ReferenceTab
              blocks={referenceBlocks}
              refs={module.refs}
              {...(practiceLink ? { practiceLink } : {})}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ─── Tab components ───────────────────────────────────────────────────────

interface ReadTabProps {
  anchorPrefix: string;
  blocks: readonly ContentBlockType[];
  speakable: boolean;
  status: ModuleStatus;
  onMarkCompleted: () => void;
  nextModule?: NextModuleSuggestion | null;
  onSelectNextModule?: (moduleId: string) => void;
}

function ReadTab({
  anchorPrefix,
  blocks,
  speakable,
  status,
  onMarkCompleted,
  nextModule,
  onSelectNextModule,
}: ReadTabProps) {
  return (
    <>
      <SectionToc blocks={blocks} anchorPrefix={anchorPrefix} />

      {/* `prose-sm` controls paragraph rhythm for raw text/headings; the
          per-block components keep their own surfaces (regulation cards,
          numbers grid, callouts) so prose only affects the loose copy. */}
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-[var(--ifr-text)] prose-p:text-[var(--ifr-text)] prose-strong:text-[var(--ifr-text)] prose-li:text-[var(--ifr-text)] prose-a:text-[var(--ifr-accent)]">
        {blocks.map((block, index) => (
          <div key={index} id={`${anchorPrefix}:${index}`} className="scroll-mt-20">
            <ContentBlock block={block} speakable={speakable} />
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-[var(--ifr-border)] pt-6">
        <Button
          onClick={onMarkCompleted}
          disabled={status === "completed"}
          size="default"
          className={cn(
            status === "completed" &&
              "cursor-not-allowed !bg-[var(--ifr-success)]/10 !text-[var(--ifr-success)] hover:!bg-[var(--ifr-success)]/10",
          )}
        >
          {status === "completed" ? (
            <>
              <StatusIndicator status="completed" size="sm" />
              Module Complete
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Mark as Read
            </>
          )}
        </Button>

        {nextModule && onSelectNextModule && (
          <button
            type="button"
            onClick={() => onSelectNextModule(nextModule.id)}
            className={cn(
              "mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-left transition-colors",
              "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-accent)]/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-wide text-[var(--ifr-text-muted)]">
                Up next
              </span>
              <span className="mt-1 block truncate text-sm font-medium text-[var(--ifr-text)]">
                {nextModule.title}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--ifr-text-muted)]">
                {nextModule.estReadingMinutes} min read
              </span>
            </span>
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="shrink-0 text-[var(--ifr-text-muted)]"
            />
          </button>
        )}
      </div>
    </>
  );
}

interface DrillTabProps {
  anchorPrefix: string;
  blocks: readonly ContentBlockType[];
  hasPracticeLink: boolean;
}

function DrillTab({ anchorPrefix, blocks, hasPracticeLink }: DrillTabProps) {
  return (
    <>
      <SectionToc blocks={blocks} anchorPrefix={anchorPrefix} />
      <div className="rounded-lg border border-[var(--ifr-info)]/40 bg-[var(--ifr-info-soft)] p-3 text-sm text-[var(--ifr-info)]">
        Active-recall practice. Tap a question to reveal the answer.
      </div>
      <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
        {blocks.map((block, index) => (
          <div key={index} id={`${anchorPrefix}:${index}`} className="scroll-mt-20">
            <ContentBlock block={block} />
          </div>
        ))}
      </div>
      {!hasPracticeLink && (
        <Link
          href="/quiz"
          className={cn(
            "mt-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/5 p-4 text-sm font-medium text-[var(--ifr-accent)] transition-colors",
            "hover:border-[var(--ifr-accent)]/70 hover:bg-[var(--ifr-accent)]/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={16} aria-hidden="true" />
            Practice these in /quiz — full active-recall mode
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </>
  );
}

interface ReferenceTabProps {
  blocks: readonly ContentBlockType[];
  refs: Module["refs"];
  practiceLink?: PracticeLink;
}

function ReferenceTab({ blocks, refs, practiceLink }: ReferenceTabProps) {
  return (
    <div className="space-y-4">
      {blocks.length > 0 && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {blocks.map((block, index) => (
            <ContentBlock key={index} block={block} />
          ))}
        </div>
      )}

      {refs.length > 0 && <References refs={refs} />}

      {practiceLink && (
        <Link
          href={practiceLink.href}
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl border border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/5 p-4 text-sm font-medium text-[var(--ifr-accent)] transition-colors",
            "hover:border-[var(--ifr-accent)]/70 hover:bg-[var(--ifr-accent)]/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          )}
        >
          <span className="flex items-center gap-2">
            <Radio size={16} aria-hidden="true" />
            {practiceLink.label}
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
