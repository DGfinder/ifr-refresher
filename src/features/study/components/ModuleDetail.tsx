"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import type { Module } from "@/content/model/section";
import type { ModuleStatus } from "@/features/progress";
import { Badge } from "@/shared/ui/Badge";
import { ContentBlock } from "@/content/components/ContentBlock";
import { References } from "@/content/components/References";
import { StatusIndicator } from "@/features/progress";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { ReadingProgress } from "@/features/study/components/ReadingProgress";

interface PracticeLink {
  href: string;
  label: string;
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
}

export function ModuleDetail({
  module,
  status,
  sectionId,
  onBack,
  onMarkCompleted,
  practiceLink,
}: ModuleDetailProps) {
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
        </div>

        {/* Tags — tap to filter the section's module list by that tag. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {module.tags.map((tag) => (
            <Link
              key={tag}
              href={`/study?section=${encodeURIComponent(sectionId)}&tag=${encodeURIComponent(tag)}`}
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
            <ContentBlock key={index} block={block} />
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
      </div>
    </div>
  );
}
