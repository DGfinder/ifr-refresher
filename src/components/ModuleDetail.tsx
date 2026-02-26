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
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {module.title}
          </h1>
          <Badge variant={module.level} className="mt-1">
            {module.level}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-foreground/90">{module.summary}</p>
      </div>

      {/* Content */}
      <div className="prose-custom">
        {module.content.map((block, index) => (
          <ContentBlock key={index} block={block} />
        ))}
      </div>

      {/* References */}
      <References refs={module.refs} />

      {/* Mark as Completed button */}
      <div className="mt-8 border-t border-border pt-6">
        <button
          onClick={onMarkCompleted}
          disabled={status === "completed"}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            status === "completed"
              ? "cursor-not-allowed bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
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
