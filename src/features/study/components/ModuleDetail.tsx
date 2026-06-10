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

interface PracticeLink {
  href: string;
  label: string;
}

interface ModuleDetailProps {
  module: Module;
  status: ModuleStatus;
  onBack: () => void;
  onMarkCompleted: () => void;
  /** Optional CTA shown below references — used by radio-calls modules to
   * deep-link into the matching Drill tab filter. */
  practiceLink?: PracticeLink;
}

export function ModuleDetail({
  module,
  status,
  onBack,
  onMarkCompleted,
  practiceLink,
}: ModuleDetailProps) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--ifr-text-muted)] hover:text-[var(--ifr-text)]"
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
        </button>

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

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {module.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[var(--ifr-surface-muted)] px-2.5 py-1 text-sm text-[var(--ifr-text)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)]/30 p-4">
        <p className="text-[var(--ifr-text)]/90">{module.summary}</p>
      </div>

      {/* Content */}
      <div className="prose-custom">
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
        <button
          onClick={onMarkCompleted}
          disabled={status === "completed"}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            status === "completed"
              ? "cursor-not-allowed bg-[var(--ifr-success)]/10 text-[var(--ifr-success)]"
              : "bg-[var(--ifr-cta-bg)] text-white hover:bg-[var(--ifr-cta-bg-hover)]"
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
        </button>
      </div>
    </div>
  );
}
