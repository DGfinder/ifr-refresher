"use client";

import type { Module } from "@/types/section";
import type { ModuleStatus } from "@/types/progress";
import { Badge } from "./Badge";
import { ContentBlock } from "./ContentBlock";
import { References } from "./References";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

interface ModuleDetailProps {
  module: Module;
  status: ModuleStatus;
  onBack: () => void;
  onMarkCompleted: () => void;
}

export function ModuleDetail({
  module,
  status,
  onBack,
  onMarkCompleted,
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
              law: 0,
              numbers: 1,
              reference: 2,
              ops_context: 3,
              traps: 4,
              ipc_questions: 5,
              airline_questions: 6,
              scenario: 7,
            };
            return (ORDER[a.type] ?? -1) - (ORDER[b.type] ?? -1);
          })
          .map((block, index) => (
            <ContentBlock key={index} block={block} />
          ))}
      </div>

      {/* References */}
      <References refs={module.refs} />

      {/* Mark as Completed button */}
      <div className="mt-8 border-t border-[var(--ifr-border)] pt-6">
        <button
          onClick={onMarkCompleted}
          disabled={status === "completed"}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            status === "completed"
              ? "cursor-not-allowed bg-[var(--ifr-success)]/10 text-[var(--ifr-success)]"
              : "bg-[var(--ifr-accent)] text-white hover:bg-[var(--ifr-accent)]/90"
          )}
        >
          {status === "completed" ? (
            <>
              <StatusIndicator status="completed" size="sm" />
              Completed
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
              Mark as Completed
            </>
          )}
        </button>
      </div>
    </div>
  );
}
