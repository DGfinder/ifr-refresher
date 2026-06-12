"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, Radio, Sparkles } from "lucide-react";
import type { Module } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { Badge } from "@/shared/ui/Badge";
import { ContentBlock } from "@/content/components/ContentBlock";
import { References } from "@/content/components/References";
import { StatusIndicator } from "@/features/progress";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
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
  /** Optional CTA shown below references — used by radio-calls modules to
   * deep-link into the matching Drill tab filter. */
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
  const { isBookmarked, toggleBookmark, isLoaded: bookmarksLoaded } =
    useStudyBookmarks();
  const bookmarked = bookmarksLoaded && isBookmarked(sectionId, module.id);
  // A module has tappable IPC / interview question blocks. We surface a
  // "Test yourself" CTA when it does — points the learner at /quiz for
  // active recall practice.
  const hasQuestions = module.content.some(
    (b) => b.type === "ipc_questions" || b.type === "airline_questions",
  );
  return (
    <div className="mx-auto max-w-3xl">
      {/* Reading progress — sticky bar at the very top of the page that
          tracks scroll position. Resets to 0 on module change via key. */}
      <ReadingProgress trackingKey={module.id} />
      {/* Header with back button */}
      <div className="mb-6">
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
          {/* Save for later review — separate from completion. */}
          <button
            type="button"
            onClick={() => {
              void toggleBookmark(sectionId, module.id);
            }}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove from saved" : "Save for review"}
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
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
            <span className="text-xs">
              {bookmarked ? "Saved" : "Save"}
            </span>
          </button>
        </div>

        {/* Tags — tap to filter the section's module list by that tag. */}
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
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)]/30 p-4">
        <p className="text-[var(--ifr-text)]/90">{module.summary}</p>
      </div>

      {/* Content. \`prose-sm\` provides mobile-friendly line-height +
          spacing; the existing per-block components keep their own
          coloured surfaces (law/numbers/traps) so prose only affects
          paragraph + list rhythm. */}
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-[var(--ifr-text)] prose-p:text-[var(--ifr-text)] prose-strong:text-[var(--ifr-text)] prose-li:text-[var(--ifr-text)] prose-a:text-[var(--ifr-accent)]">
        {[...module.content]
          .sort((a, b) => {
            const ORDER: Record<string, number> = {
              ops_context: 0,
              numbers: 1,
              traps: 2,
              law: 3,
              reference: 4,
              qa: 5,
              ipc_questions: 6,
              airline_questions: 7,
              scenario: 8,
            };
            return (ORDER[a.type] ?? 99) - (ORDER[b.type] ?? 99);
          })
          .map((block, index) => (
            <ContentBlock key={index} block={block} speakable={speakable} />
          ))}
      </div>

      {/* References */}
      <References refs={module.refs} />

      {/* Optional practice CTA (radio-calls modules deep-link into Drill tab) */}
      {practiceLink && (
        <Link
          href={practiceLink.href}
          className={cn(
            "mt-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/5 p-4 text-sm font-medium text-[var(--ifr-accent)] transition-colors",
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

      {/* Test yourself — surfaces when the module has embedded Q&A blocks.
          Points at the quiz to encourage active recall. Skipped on
          radio-calls modules where the practiceLink already covers
          practice. */}
      {hasQuestions && !practiceLink && (
        <Link
          href="/quiz"
          className={cn(
            "mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/5 p-4 text-sm font-medium text-[var(--ifr-accent)] transition-colors",
            "hover:border-[var(--ifr-accent)]/70 hover:bg-[var(--ifr-accent)]/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={16} aria-hidden="true" />
            Test yourself — active recall in the quiz
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}

      {/* Mark as Completed button */}
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

        {/* Next module — surfaces the next unread module in the same
            section so a learner who just finished one can keep going
            without backtracking to the list. Tap routes via the parent
            so the URL + state stay in sync. */}
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
    </div>
  );
}
